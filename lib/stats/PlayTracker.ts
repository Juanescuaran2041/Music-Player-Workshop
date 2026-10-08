import { Song } from "../Song";
import { GenreResolver } from "./GenreResolver";
import { Play } from "./Play";
import { PlayHistoryRepository } from "./PlayHistoryRepository";

type Session = {
  song: Song;
  startedAt: Date;
  listened: number;
  lastTime: number;
};

export class PlayTracker {
  private static readonly MIN_SECONDS = 30;
  private static readonly MAX_STEP_SECONDS = 2;
  private static readonly RESTART_SECONDS = 2;

  private session: Session | null = null;

  constructor(
    private readonly repository: PlayHistoryRepository,
    private readonly genres: GenreResolver,
    private readonly onError: (error: Error) => void = () => {},
  ) {}

  update(song: Song | null, currentTime: number, isPlaying: boolean): void {
    if (song?.id !== this.session?.song.id || this.restarted(currentTime)) {
      this.flush();
      this.session = song ? this.start(song, currentTime) : null;
      return;
    }

    const session = this.session;
    if (!session) return;

    const step = currentTime - session.lastTime;
    if (isPlaying && step > 0 && step <= PlayTracker.MAX_STEP_SECONDS) {
      session.listened += step;
    }
    session.lastTime = currentTime;
  }

  flush(): void {
    const session = this.session;
    this.session = null;
    if (!session || session.listened < this.thresholdFor(session.song)) return;
    void this.record(session);
  }

  private start(song: Song, currentTime: number): Session {
    return { song, startedAt: new Date(), listened: 0, lastTime: currentTime };
  }

  private restarted(currentTime: number): boolean {
    const session = this.session;
    return (
      session !== null &&
      currentTime < PlayTracker.RESTART_SECONDS &&
      session.lastTime - currentTime > PlayTracker.RESTART_SECONDS &&
      session.listened >= this.thresholdFor(session.song)
    );
  }

  private thresholdFor(song: Song): number {
    return song.duration > 0
      ? Math.min(PlayTracker.MIN_SECONDS, song.duration / 2)
      : PlayTracker.MIN_SECONDS;
  }

  private async record(session: Session): Promise<void> {
    const { song, startedAt, listened } = session;
    try {
      const genre = await this.genres.resolve(song.title, song.artist);
      await this.repository.record(
        new Play(
          song.title,
          song.artist,
          genre,
          Play.sourceOf(song),
          listened,
          startedAt,
        ),
      );
    } catch (error) {
      this.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
