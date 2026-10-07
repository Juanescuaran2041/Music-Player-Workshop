import { Song } from "./Song";
import { searchSpotify } from "./spotify/api";
import { searchTracks, trackToSong } from "./youtube";

export type Source = "spotify" | "youtube";

export function searchSongs(source: Source, query: string): Promise<Song[]> {
  if (source === "spotify") return searchSpotify(query);
  return searchTracks(query).then((tracks) => tracks.map(trackToSong));
}

// Identifies a song across sources, used to hide ones already queued
export function songSourceId(song: Song): string {
  return song.spotifyUri || song.videoId;
}
