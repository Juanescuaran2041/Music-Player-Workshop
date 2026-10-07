import { Song } from "./Song";

export const UNKNOWN_ARTIST = "Unknown artist";

// What the "Made for you" subtitle mentions: the current artist,
// or the title when the artist is unknown (e.g. imported files).
export function seedTerm(song: Song | null): string {
  if (!song) return "top hits";
  return song.artist === UNKNOWN_ARTIST ? song.title : song.artist;
}

export function recommendationQuery(song: Song | null): string {
  if (!song) return "top music hits";
  return song.artist === UNKNOWN_ARTIST
    ? `${song.title} similar songs`
    : `${song.artist} songs`;
}
