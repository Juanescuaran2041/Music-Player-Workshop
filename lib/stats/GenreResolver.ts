import { UNKNOWN_ARTIST } from "../recommendations";

type ITunesResult = { primaryGenreName?: string };

export class GenreResolver {
  static readonly UNKNOWN_GENRE = "Unknown";

  private static readonly ENDPOINT = "https://itunes.apple.com/search";
  private static readonly CACHE_PREFIX = "bloommod:genre:";

  private readonly inflight = new Map<string, Promise<string>>();

  resolve(title: string, artist: string): Promise<string> {
    const term = this.termFor(title, artist);
    if (!term) return Promise.resolve(GenreResolver.UNKNOWN_GENRE);

    const cached = this.readCache(term);
    if (cached) return Promise.resolve(cached);

    let pending = this.inflight.get(term);
    if (!pending) {
      pending = this.lookup(term)
        .then((genre) => {
          if (genre !== GenreResolver.UNKNOWN_GENRE) this.writeCache(term, genre);
          return genre;
        })
        .finally(() => this.inflight.delete(term));
      this.inflight.set(term, pending);
    }
    return pending;
  }

  private termFor(title: string, artist: string): string {
    const parts = artist === UNKNOWN_ARTIST ? [title] : [artist, title];
    return parts.join(" ").replace(/\s+/g, " ").trim().toLowerCase();
  }

  private async lookup(term: string): Promise<string> {
    const params = new URLSearchParams({
      term,
      media: "music",
      entity: "song",
      limit: "1",
    });
    try {
      const response = await fetch(`${GenreResolver.ENDPOINT}?${params}`);
      if (!response.ok) return GenreResolver.UNKNOWN_GENRE;
      const data: { results?: ITunesResult[] } = await response.json();
      return data.results?.[0]?.primaryGenreName || GenreResolver.UNKNOWN_GENRE;
    } catch {
      return GenreResolver.UNKNOWN_GENRE;
    }
  }

  private readCache(term: string): string | null {
    try {
      return localStorage.getItem(GenreResolver.CACHE_PREFIX + term);
    } catch {
      return null;
    }
  }

  private writeCache(term: string, genre: string): void {
    try {
      localStorage.setItem(GenreResolver.CACHE_PREFIX + term, genre);
    } catch {
      return;
    }
  }
}
