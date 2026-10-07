/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Song } from "@/lib/Song";
import {
  fetchRecommendations,
  seedTerm,
  songKey,
} from "@/lib/recommendations";

type Props = {
  seed: Song | null;
  queue: Song[];
  onAdd: (song: Song) => void;
  onPlay: (song: Song) => void;
};

type Result = { term: string; songs: Song[]; failed: boolean };

export default function Recommendations({ seed, queue, onAdd, onPlay }: Props) {
  const term = seedTerm(seed);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchRecommendations(term, controller.signal)
      .then((songs) => setResult({ term, songs, failed: false }))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setResult({ term, songs: [], failed: true });
        }
      });
    return () => controller.abort();
  }, [term]);

  const loading = result?.term !== term;
  const queued = new Set(queue.map((s) => songKey(s.title, s.artist)));
  const suggestions = (result?.songs ?? [])
    .filter((s) => !queued.has(songKey(s.title, s.artist)))
    .slice(0, 8);

  return (
    <section className="rounded-3xl bg-surface/80 p-4 ring-1 ring-white/10 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Made for you</h2>
        <p className="truncate text-sm text-muted">
          {seed ? `Because you're listening to ${term}` : "Popular right now"}
        </p>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted">Finding songs for you...</p>
      ) : result?.failed ? (
        <p className="py-8 text-center text-muted">
          Couldn&apos;t load suggestions. Check your connection.
        </p>
      ) : suggestions.length === 0 ? (
        <p className="py-8 text-center text-muted">
          No new suggestions right now.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {suggestions.map((song) => (
            <li
              key={song.id}
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5"
            >
              {song.cover ? (
                <img
                  src={song.cover}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-lg bg-brand" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{song.title}</p>
                <p className="truncate text-xs text-muted">{song.artist}</p>
              </div>
              <button
                onClick={() => onPlay(song)}
                aria-label={`Play ${song.title}`}
                className="rounded-full p-2 text-muted transition hover:bg-white/10 hover:text-accent-hover"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </button>
              <button
                onClick={() => onAdd(song)}
                aria-label={`Add ${song.title} to queue`}
                className="rounded-full p-2 text-muted transition hover:bg-white/10 hover:text-accent-hover"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
