/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Song } from "@/lib/Song";
import { PlaylistResult } from "@/lib/usePlaylists";

// Lets a result be saved into one of the user's playlists
export type PlaylistPicker = {
  playlists: { id: string; name: string }[];
  onAdd: (playlistId: string, song: Song) => PlaylistResult;
};

type Props = {
  songs: Song[];
  onAdd: (song: Song) => void;
  onPlay: (song: Song) => void;
  picker?: PlaylistPicker;
};

const iconButton =
  "rounded-full p-2 text-muted transition hover:bg-foreground/10 hover:text-accent-hover active:scale-90";

export default function SongResultList({
  songs,
  onAdd,
  onPlay,
  picker,
}: Props) {
  // Only one result shows its playlist choices at a time
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<
    ({ songId: string } & PlaylistResult) | null
  >(null);

  function handlePick(playlistId: string, song: Song) {
    if (!picker) return;
    const result = picker.onAdd(playlistId, song);
    setFeedback({ songId: song.id, ...result });
    if (result.ok) setPickingId(null);
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {songs.map((song, index) => (
        <li
          key={song.id}
          style={{ animationDelay: `${index * 40}ms` }}
          className="result-in group flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-xl p-2 transition hover:-translate-y-0.5 hover:bg-foreground/5"
        >
          {/* Mouse users can play straight from the cover; the play button
              below stays available for keyboards and touch */}
          <div
            aria-hidden="true"
            onClick={() => onPlay(song)}
            className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg"
          >
            {song.cover ? (
              <img
                src={song.cover}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full bg-brand" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{song.title}</p>
            <p className="truncate text-xs text-muted">{song.artist}</p>
          </div>
          <button
            onClick={() => onPlay(song)}
            aria-label={`Play ${song.title}`}
            className={iconButton}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </button>
          <button
            onClick={() => onAdd(song)}
            aria-label={`Add ${song.title} to queue`}
            className={iconButton}
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
          {picker && (
            <button
              onClick={() => {
                setFeedback(null);
                setPickingId(pickingId === song.id ? null : song.id);
              }}
              aria-label={`Add ${song.title} to a playlist`}
              aria-expanded={pickingId === song.id}
              title="Add to a playlist"
              className={`${iconButton} ${pickingId === song.id ? "bg-accent/15 text-accent-hover" : ""}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h11M4 12h11M4 18h7M18 14v6M15 17h6" />
              </svg>
            </button>
          )}

          {picker && pickingId === song.id && (
            <div className="result-in flex basis-full flex-wrap items-center gap-1.5 pl-15">
              {picker.playlists.length === 0 ? (
                <span className="text-xs text-muted">
                  Create a playlist in My playlists first.
                </span>
              ) : (
                <>
                  <span className="text-xs text-muted">Add to:</span>
                  {picker.playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handlePick(playlist.id, song)}
                      className="max-w-40 truncate rounded-full bg-foreground/5 px-3 py-1 text-xs ring-1 ring-foreground/10 transition hover:bg-accent hover:text-on-accent active:scale-95"
                    >
                      {playlist.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {feedback?.songId === song.id && (
            <p
              role="status"
              className={`basis-full pl-15 text-xs ${feedback.ok ? "text-emerald-600" : "text-rose-600"}`}
            >
              {feedback.message}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
