"use client";

import { useEffect, useState } from "react";
import { searchSongs, songSourceId, Source } from "@/lib/music";
import { Song } from "@/lib/Song";
import { recommendationQuery, seedTerm } from "@/lib/recommendations";
import SongResultList from "./SongResultList";

type Props = {
  source: Source;
  connected: boolean;
  seed: Song | null;
  queue: Song[];
  onAdd: (song: Song) => void;
  onPlay: (song: Song) => void;
};

type Result = { key: string; songs: Song[]; error: string };

export default function Recommendations({
  source,
  connected,
  seed,
  queue,
  onAdd,
  onPlay,
}: Props) {
  const query = recommendationQuery(seed);
  const key = `${source}:${query}`;
  const blocked = source === "spotify" && !connected;
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (blocked) return;
    searchSongs(source, query)
      .then((songs) => setResult({ key, songs, error: "" }))
      .catch((error) =>
        setResult({
          key,
          songs: [],
          error:
            error instanceof Error
              ? error.message
              : "Couldn't load suggestions.",
        }),
      );
  }, [blocked, source, query, key]);

  const loading = result?.key !== key;
  const queued = new Set(queue.map(songSourceId));
  const suggestions = (result?.songs ?? [])
    .filter((song) => !queued.has(songSourceId(song)))
    .slice(0, 8);

  return (
    <section className="rounded-3xl bg-surface/80 p-4 ring-1 ring-foreground/10 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Made for you</h2>
        <p className="truncate text-sm text-muted">
          {seed
            ? `Because you're listening to ${seedTerm(seed)}`
            : "Popular right now"}
        </p>
      </div>

      {blocked ? (
        <p className="py-8 text-center text-muted">
          Connect Spotify to get recommendations.
        </p>
      ) : loading ? (
        <p className="py-8 text-center text-muted">Finding songs for you...</p>
      ) : result?.error ? (
        <p className="py-8 text-center text-sm text-rose-600">
          {result.error}
        </p>
      ) : suggestions.length === 0 ? (
        <p className="py-8 text-center text-muted">
          No new suggestions right now.
        </p>
      ) : (
        <SongResultList songs={suggestions} onAdd={onAdd} onPlay={onPlay} />
      )}
    </section>
  );
}
