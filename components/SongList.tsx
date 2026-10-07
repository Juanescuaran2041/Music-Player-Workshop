"use client";

/* eslint-disable @next/next/no-img-element */
import { DragEvent, KeyboardEvent, useState } from "react";
import { Song } from "@/lib/Song";
import { formatDuration } from "@/lib/format";

type Props = {
  songs: Song[];
  currentId: string | null;
  isPlaying: boolean;
  onSelect: (song: Song) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, toIndex: number) => void;
};

export default function SongList({
  songs,
  currentId,
  isPlaying,
  onSelect,
  onRemove,
  onMove,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const fromIndex = songs.findIndex((song) => song.id === draggingId);

  function resetDrag() {
    setDraggingId(null);
    setOverIndex(null);
  }

  function handleDragStart(event: DragEvent, song: Song) {
    event.dataTransfer.effectAllowed = "move";
    // Firefox only starts a drag when some data is set
    event.dataTransfer.setData("text/plain", song.id);
    setDraggingId(song.id);
  }

  function handleDragOver(event: DragEvent, index: number) {
    if (draggingId === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overIndex !== index) setOverIndex(index);
  }

  function handleDrop(event: DragEvent, index: number) {
    event.preventDefault();
    if (draggingId !== null && fromIndex !== index) onMove(draggingId, index);
    resetDrag();
  }

  // Keyboard alternative to dragging: Alt + Arrow Up / Arrow Down
  function handleKeyDown(event: KeyboardEvent, song: Song, index: number) {
    if (!event.altKey) return;
    if (event.key === "ArrowUp" && index > 0) {
      event.preventDefault();
      onMove(song.id, index - 1);
    } else if (event.key === "ArrowDown" && index < songs.length - 1) {
      event.preventDefault();
      onMove(song.id, index + 1);
    }
  }

  return (
    <section className="rounded-3xl bg-surface/80 p-4 ring-1 ring-foreground/10 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Queue</h2>
        <span className="text-sm text-muted">
          {songs.length} {songs.length === 1 ? "song" : "songs"}
        </span>
      </div>

      {songs.length === 0 ? (
        <p className="py-12 text-center text-muted">
          Your queue is empty. Add your first song.
        </p>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted">
            Drag songs to reorder them, or press Alt + Arrow Up / Down.
          </p>
          <ul
            className="flex flex-col gap-1"
            onDragLeave={(event) => {
              // Only clear the indicator when the pointer leaves the whole list
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setOverIndex(null);
              }
            }}
          >
            {songs.map((song, index) => {
              const active = song.id === currentId;
              const dragging = song.id === draggingId;
              const dropTarget =
                draggingId !== null && overIndex === index && !dragging;
              // The line shows where the dragged song will land
              const dropLine = dropTarget
                ? fromIndex > index
                  ? "border-t-accent"
                  : "border-b-accent"
                : "";

              return (
                <li
                  key={song.id}
                  draggable
                  onDragStart={(event) => handleDragStart(event, song)}
                  onDragOver={(event) => handleDragOver(event, index)}
                  onDrop={(event) => handleDrop(event, index)}
                  onDragEnd={resetDrag}
                  className={`group flex items-center gap-3 rounded-xl border-y-2 border-transparent px-3 py-3 transition-colors ${dropLine} ${
                    dragging ? "opacity-40" : ""
                  } ${
                    active
                      ? "bg-accent/15 ring-1 ring-accent/40"
                      : "hover:bg-foreground/5"
                  }`}
                >
                  <span
                    className="cursor-grab text-muted active:cursor-grabbing"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <circle cx="9" cy="6" r="1.6" />
                      <circle cx="15" cy="6" r="1.6" />
                      <circle cx="9" cy="12" r="1.6" />
                      <circle cx="15" cy="12" r="1.6" />
                      <circle cx="9" cy="18" r="1.6" />
                      <circle cx="15" cy="18" r="1.6" />
                    </svg>
                  </span>
                  <span className="flex w-6 justify-end text-sm text-muted">
                    {active ? (
                      <span
                        className="flex items-end gap-0.5"
                        data-playing={isPlaying}
                        aria-hidden="true"
                      >
                        <span className="eq-bar" />
                        <span className="eq-bar" />
                        <span className="eq-bar" />
                      </span>
                    ) : (
                      index + 1
                    )}
                  </span>
                  {song.cover && (
                    <img
                      src={song.cover}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <button
                    onClick={() => onSelect(song)}
                    onKeyDown={(event) => handleKeyDown(event, song, index)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p
                      className={`truncate font-medium ${
                        active ? "text-accent-hover" : ""
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="truncate text-sm text-muted">{song.artist}</p>
                  </button>
                  <span className="text-sm text-muted">
                    {formatDuration(song.duration)}
                  </span>
                  <button
                    onClick={() => onRemove(song.id)}
                    aria-label={`Remove ${song.title}`}
                    className="rounded-full p-2 text-muted transition hover:bg-foreground/10 hover:text-rose-600 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
