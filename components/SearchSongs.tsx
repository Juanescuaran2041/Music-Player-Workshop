"use client";

import { FormEvent, useState } from "react";
import { Song } from "@/lib/Song";
import { searchTracks, trackToSong } from "@/lib/youtube";
import SongResultList from "./SongResultList";

type Props = {
  onAdd: (song: Song) => void;
  onPlay: (song: Song) => void;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; songs: Song[] };

export default function SearchSongs({ onAdd, onPlay }: Props) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;

    setState({ status: "loading" });
    try {
      const tracks = await searchTracks(query);
      setState({ status: "done", songs: tracks.map(trackToSong) });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <section className="rounded-3xl bg-surface/80 p-4 ring-1 ring-white/10 sm:p-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any song or artist"
          aria-label="Search songs"
          className="field"
        />
        <button
          type="submit"
          disabled={state.status === "loading"}
          className="btn-primary shrink-0"
        >
          Search
        </button>
      </form>

      {state.status === "loading" && (
        <p className="pt-6 text-center text-muted">Searching...</p>
      )}
      {state.status === "error" && (
        <p className="pt-6 text-center text-sm text-rose-300">
          {state.message}
        </p>
      )}
      {state.status === "done" && (
        <div className="mt-4">
          {state.songs.length === 0 ? (
            <p className="py-4 text-center text-muted">No results.</p>
          ) : (
            <SongResultList
              songs={state.songs}
              onAdd={onAdd}
              onPlay={onPlay}
            />
          )}
        </div>
      )}
    </section>
  );
}
