import { useEffect, useRef, useState } from "react";
import { Library } from "./Library";
import { songSourceId } from "./music";
import {
  canSave,
  cloneSong,
  deletePlaylist,
  fromStored,
  loadPlaylists,
  savePlaylist,
  StoredPlaylist,
} from "./playlists";
import { Song } from "./Song";

// What the interface draws for each playlist
export type PlaylistView = {
  id: string;
  name: string;
  songs: Song[];
};

export type PlaylistResult = { ok: boolean; message: string };

const MAX_NAME = 40;

// Shown while lib/Library.ts still has unimplemented methods
const NOT_READY =
  "Playlists are not ready yet: finish the methods in lib/Library.ts.";

function snapshot(library: Library): PlaylistView[] {
  return library.toArray().map((node) => ({
    id: node.id,
    name: node.name,
    songs: node.playlist.toArray(),
  }));
}

function buildLibrary(rows: StoredPlaylist[]): Library {
  const library = new Library();
  for (const row of rows) {
    const node = library.create(row.id, row.name);
    for (const song of row.songs) node.playlist.addLast(fromStored(song));
  }
  return library;
}

const fail = (message: string): PlaylistResult => ({ ok: false, message });

// Keeps the saved playlists in a Library (linked list) and mirrors every
// change to Supabase. The Library is the source of truth for the interface.
export function usePlaylists() {
  const libraryRef = useRef(new Library());
  const [playlists, setPlaylists] = useState<PlaylistView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadPlaylists()
      .then((rows) => {
        if (cancelled) return;
        libraryRef.current = buildLibrary(rows);
        setPlaylists(snapshot(libraryRef.current));
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  function refresh() {
    setPlaylists(snapshot(libraryRef.current));
  }

  function persist(id: string) {
    const node = libraryRef.current.find(id);
    if (!node) return;
    savePlaylist(node)
      .then(() => setError(""))
      .catch((e: Error) => setError(e.message));
  }

  function checkName(name: string, exceptId?: string): string {
    if (!name) return "Give the playlist a name.";
    if (name.length > MAX_NAME) {
      return `Names can have up to ${MAX_NAME} characters.`;
    }
    const existing = libraryRef.current.findByName(name);
    if (existing && existing.id !== exceptId) {
      return `You already have a playlist called "${existing.name}".`;
    }
    return "";
  }

  // Creates a playlist, optionally filled with songs (e.g. the current queue)
  function create(rawName: string, songs: Song[] = []): PlaylistResult {
    const name = rawName.trim();
    const problem = checkName(name);
    if (problem) return fail(problem);

    const library = libraryRef.current;
    const node = library.create(crypto.randomUUID(), name);
    if (!library.find(node.id)) return fail(NOT_READY);

    const saved = songs.filter(canSave);
    for (const song of saved) node.playlist.addLast(cloneSong(song));
    refresh();
    persist(node.id);

    const skipped = songs.length - saved.length;
    return {
      ok: true,
      message: skipped
        ? `Created "${name}". ${skipped} imported file(s) were left out because they cannot be saved.`
        : `Created "${name}".`,
    };
  }

  function rename(id: string, rawName: string): PlaylistResult {
    const name = rawName.trim();
    const problem = checkName(name, id);
    if (problem) return fail(problem);
    if (!libraryRef.current.rename(id, name)) return fail(NOT_READY);

    refresh();
    persist(id);
    return { ok: true, message: `Renamed to "${name}".` };
  }

  function remove(id: string): PlaylistResult {
    const removed = libraryRef.current.remove(id);
    if (!removed) return fail(NOT_READY);

    refresh();
    deletePlaylist(id)
      .then(() => setError(""))
      .catch((e: Error) => setError(e.message));
    return { ok: true, message: `Deleted "${removed.name}".` };
  }

  function addSong(id: string, song: Song): PlaylistResult {
    const node = libraryRef.current.find(id);
    if (!node) return fail(NOT_READY);
    if (!canSave(song))
      return fail("Imported files cannot be saved in playlists.");

    // Songs added by hand have no source id, so they are never duplicates
    const sourceId = songSourceId(song);
    const saved = node.playlist.toArray();
    if (sourceId && saved.some((s) => songSourceId(s) === sourceId)) {
      return fail(`Already in "${node.name}".`);
    }

    node.playlist.addLast(cloneSong(song));
    refresh();
    persist(id);
    return { ok: true, message: `Added to "${node.name}".` };
  }

  function removeSong(id: string, songId: string) {
    const node = libraryRef.current.find(id);
    if (!node || !node.playlist.remove(songId)) return;
    refresh();
    persist(id);
  }

  return {
    playlists,
    loading,
    error,
    create,
    rename,
    remove,
    addSong,
    removeSong,
  };
}

export type Playlists = ReturnType<typeof usePlaylists>;
