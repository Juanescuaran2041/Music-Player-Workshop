import type { PostgrestError } from "@supabase/supabase-js";
import { LibraryNode } from "./Library";
import { Song } from "./Song";
import { createBrowserSupabase } from "./supabase/client";

// What each song looks like inside the "songs" JSON column
export type StoredSong = {
  title: string;
  artist: string;
  duration: number;
  url: string;
  cover: string;
  videoId: string;
  spotifyUri: string;
};

export type StoredPlaylist = {
  id: string;
  name: string;
  songs: StoredSong[];
};

export class PlaylistStoreError extends Error {}

let client: ReturnType<typeof createBrowserSupabase> | null = null;

function supabase() {
  client ??= createBrowserSupabase();
  return client;
}

function storeError(error: PostgrestError): PlaylistStoreError {
  // The table is created by hand, so say how when it is missing
  if (error.code === "42P01" || error.code === "PGRST205") {
    return new PlaylistStoreError(
      "The playlists table does not exist yet. Run supabase/playlists.sql in the Supabase SQL Editor.",
    );
  }
  return new PlaylistStoreError(
    `Could not save your playlists (${error.message}).`,
  );
}

// Imported files only exist in this browser tab (blob: URLs), so they
// cannot be stored and played again later.
export function canSave(song: Song): boolean {
  return !song.url.startsWith("blob:");
}

// A Song is also a list node (prev/next), so the same object cannot sit in
// two lists. Every list gets its own copy with a new id.
export function cloneSong(song: Song): Song {
  return new Song(
    crypto.randomUUID(),
    song.title,
    song.artist,
    song.duration,
    song.url,
    song.cover,
    song.videoId,
    song.spotifyUri,
  );
}

export function toStored(song: Song): StoredSong {
  return {
    title: song.title,
    artist: song.artist,
    duration: song.duration,
    url: song.url,
    cover: song.cover,
    videoId: song.videoId,
    spotifyUri: song.spotifyUri,
  };
}

export function fromStored(song: StoredSong): Song {
  return new Song(
    crypto.randomUUID(),
    song.title,
    song.artist,
    song.duration,
    song.url,
    song.cover,
    song.videoId,
    song.spotifyUri,
  );
}

export async function loadPlaylists(): Promise<StoredPlaylist[]> {
  const { data, error } = await supabase()
    .from("playlists")
    .select("id, name, songs")
    .order("created_at");
  if (error) throw storeError(error);
  return data as StoredPlaylist[];
}

// Creates the row the first time and replaces it afterwards
export async function savePlaylist(node: LibraryNode): Promise<void> {
  const { error } = await supabase()
    .from("playlists")
    .upsert({
      id: node.id,
      name: node.name,
      songs: node.playlist.toArray().filter(canSave).map(toStored),
    });
  if (error) throw storeError(error);
}

export async function deletePlaylist(id: string): Promise<void> {
  const { error } = await supabase().from("playlists").delete().eq("id", id);
  if (error) throw storeError(error);
}
