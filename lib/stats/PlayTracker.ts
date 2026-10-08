import { Song } from "../Song";
import { GenreResolver } from "./GenreResolver";
import { Play } from "./Play";
import { PlayHistoryRepository } from "./PlayHistoryRepository";

type Session = {
  song: Song;
  startedAt: Date;
  listened: number;
  lastTime: number;
  recordedSeconds: number;
  playId: Promise<string | null> | null;
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

    if (!session.playId && this.qualifies(session)) {
      session.recordedSeconds = session.listened;
      session.playId = this.record(session);
    }
  }

  flush(): void {
    const session = this.session;
    this.session = null;
    if (!session?.playId || session.listened <= session.recordedSeconds) return;
    void this.updateSeconds(session.playId, session.listened);
  }

  private start(song: Song, currentTime: number): Session {
    return {
      song,
      startedAt: new Date(),
      listened: 0,
      lastTime: currentTime,
      recordedSeconds: 0,
      playId: null,
    };
  }

  private qualifies(session: Session): boolean {
    return session.listened >= this.thresholdFor(session.song);
  }

  private restarted(currentTime: number): boolean {
    const session = this.session;
    return (
      session !== null &&
      currentTime < PlayTracker.RESTART_SECONDS &&
      session.lastTime - currentTime > PlayTracker.RESTART_SECONDS &&
      this.qualifies(session)
    );
  }

  private thresholdFor(song: Song): number {
    return song.duration > 0
      ? Math.min(PlayTracker.MIN_SECONDS, song.duration / 2)
      : PlayTracker.MIN_SECONDS;
  }

  private async record(session: Session): Promise<string | null> {
    const { song, startedAt, listened } = session;
    try {
      const genre = await this.genres.resolve(song.title, song.artist);
      return await this.repository.record(
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
      this.report(error);
      return null;
    }
  }

  private async updateSeconds(
    playId: Promise<string | null>,
    seconds: number,
  ): Promise<void> {
    try {
      const id = await playId;
      if (id) await this.repository.updateSeconds(id, seconds);
    } catch (error) {
      this.report(error);
    }
  }

  private report(error: unknown): void {
    this.onError(error instanceof Error ? error : new Error(String(error)));
  }
}
