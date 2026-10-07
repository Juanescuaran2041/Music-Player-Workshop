import { Song } from "./Song";

type ITunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl?: string;
  artworkUrl100?: string;
};

export const UNKNOWN_ARTIST = "Unknown artist";

export function songKey(title: string, artist: string): string {
  return `${title}|${artist}`.toLowerCase();
}

// The seed is what the suggestions are based on: the current artist,
// or the title when the artist is unknown (e.g. imported files).
export function seedTerm(song: Song | null): string {
  if (!song) return "top hits";
  return song.artist === UNKNOWN_ARTIST ? song.title : song.artist;
}

export async function fetchRecommendations(
  term: string,
  signal?: AbortSignal,
): Promise<Song[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    term,
  )}&media=music&entity=song&limit=25`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Recommendations unavailable");

  const data: { results: ITunesTrack[] } = await response.json();
  return data.results
    .filter((track) => track.previewUrl)
    .map(
      (track) =>
        new Song(
          `itunes-${track.trackId}`,
          track.trackName,
          track.artistName,
          30,
          track.previewUrl!,
          track.artworkUrl100?.replace("100x100", "400x400") ?? "",
        ),
    );
}
