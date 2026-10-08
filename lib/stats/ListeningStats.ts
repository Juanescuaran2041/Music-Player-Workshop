import { Play, PlaySource } from "./Play";
import { Tally, TallyEntry } from "./Tally";

export type DayPeriod = "Night" | "Morning" | "Afternoon" | "Evening";

export type PeriodShare = {
  period: DayPeriod;
  plays: number;
};

export type SourceShare = {
  source: PlaySource;
  plays: number;
};

export class ListeningStats {
  static readonly PERIODS: readonly DayPeriod[] = [
    "Night",
    "Morning",
    "Afternoon",
    "Evening",
  ];

  private static readonly SOURCES: readonly PlaySource[] = [
    "youtube",
    "spotify",
    "file",
    "manual",
  ];

  private readonly genres = new Tally();
  private readonly artists = new Tally();
  private readonly songs = new Tally();
  private readonly periods = new Map<DayPeriod, number>();
  private readonly sources = new Map<PlaySource, number>();
  private totalSecondsValue = 0;

  constructor(private readonly plays: readonly Play[]) {
    for (const play of plays) this.include(play);
  }

  static periodOf(date: Date): DayPeriod {
    return ListeningStats.PERIODS[Math.floor(date.getHours() / 6)];
  }

  get totalPlays(): number {
    return this.plays.length;
  }

  get totalSeconds(): number {
    return this.totalSecondsValue;
  }

  get distinctArtists(): number {
    return this.artists.size;
  }

  get distinctGenres(): number {
    return this.genres.size;
  }

  get isEmpty(): boolean {
    return this.plays.length === 0;
  }

  topGenres(limit = 6): TallyEntry[] {
    return this.genres.top(limit);
  }

  topArtists(limit = 5): TallyEntry[] {
    return this.artists.top(limit);
  }

  topSongs(limit = 5): TallyEntry[] {
    return this.songs.top(limit);
  }

  byPeriod(): PeriodShare[] {
    return ListeningStats.PERIODS.map((period) => ({
      period,
      plays: this.periods.get(period) ?? 0,
    }));
  }

  bySource(): SourceShare[] {
    return ListeningStats.SOURCES.map((source) => ({
      source,
      plays: this.sources.get(source) ?? 0,
    })).filter((share) => share.plays > 0);
  }

  private include(play: Play): void {
    this.totalSecondsValue += play.seconds;
    this.genres.add(play.genre.toLowerCase(), play.genre, play.seconds);
    this.artists.add(play.artist.toLowerCase(), play.artist, play.seconds);
    this.songs.add(
      play.songKey,
      `${play.title} · ${play.artist}`,
      play.seconds,
    );
    this.increment(this.periods, ListeningStats.periodOf(play.playedAt));
    this.increment(this.sources, play.source);
  }

  private increment<K>(counts: Map<K, number>, key: K): void {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
}
