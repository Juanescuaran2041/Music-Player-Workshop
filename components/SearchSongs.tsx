"use client";

import { FormEvent, useState } from "react";
import { searchSongs, Source } from "@/lib/music";
import { Song } from "@/lib/Song";
import SongResultList from "./SongResultList";

type Props = {
  source: Source;
  connected: boolean;
  onAdd: (song: Song) => void;
  onPlay: (song: Song) => void;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; source: Source; songs: Song[] };

export default function SearchSongs({
  source,
  connected,
  onAdd,
  onPlay,
}: Props) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const blocked = source === "spotify" && !connected;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim() || blocked) return;

    setState({ status: "loading" });
    try {
      const songs = await searchSongs(source, query);
      setState({ status: "done", source, songs });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <section className="rounded-3xl bg-surface/80 p-4 ring-1 ring-foreground/10 sm:p-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any song or artist"
          aria-label="Search songs"
          disabled={blocked}
          className="field"
        />
        <button
          type="submit"
          disabled={blocked || state.status === "loading"}
          className="btn-primary shrink-0"
        >
          Search
        </button>
      </form>

      {blocked && (
        <p className="pt-6 text-center text-muted">
          Connect Spotify to search millions of songs.
        </p>
      )}
      {!blocked && state.status === "loading" && (
        <p className="pt-6 text-center text-muted">Searching...</p>
      )}
      {!blocked && state.status === "error" && (
        <p className="pt-6 text-center text-sm text-rose-600">
          {state.message}
        </p>
      )}
      {!blocked && state.status === "done" && state.source === source && (
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
