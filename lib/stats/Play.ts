import { Song } from "../Song";

export type PlaySource = "youtube" | "spotify" | "file" | "manual";

export class Play {
  constructor(
    public readonly title: string,
    public readonly artist: string,
    public readonly genre: string,
    public readonly source: PlaySource,
    public readonly seconds: number,
    public readonly playedAt: Date,
  ) {}

  static sourceOf(song: Song): PlaySource {
    if (song.spotifyUri) return "spotify";
    if (song.videoId) return "youtube";
    if (song.url) return "file";
    return "manual";
  }

  get songKey(): string {
    return `${this.title.toLowerCase()}|${this.artist.toLowerCase()}`;
  }
}
