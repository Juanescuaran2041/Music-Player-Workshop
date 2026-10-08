"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlayer } from "./PlayerProvider";
import VideoSlot from "./VideoSlot";

const controlClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-foreground/10 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent";

export default function MiniPlayer() {
  const pathname = usePathname();
  const player = usePlayer();
  const song = player.current;
  if (pathname === "/" || !song) return null;

  const progress =
    player.duration > 0
      ? Math.min(100, (player.currentTime / player.duration) * 100)
      : 0;

  return (
    <>
      <div aria-hidden="true" className={song.videoId ? "h-72" : "h-24"} />
      <section
        aria-label="Now playing"
        className="card-rise fixed inset-x-4 bottom-4 z-30 overflow-hidden rounded-2xl bg-surface/90 shadow-2xl shadow-slate-900/20 ring-1 ring-foreground/10 backdrop-blur sm:left-auto sm:w-80"
      >
        <VideoSlot />
        <div className="flex items-center gap-3 p-3">
          {!song.videoId &&
            (song.cover ? (
              <div
                aria-hidden="true"
                className="h-11 w-11 shrink-0 rounded-lg bg-cover bg-center"
                style={{ backgroundImage: `url("${song.cover}")` }}
              />
            ) : (
              <div className="h-11 w-11 shrink-0 rounded-lg bg-brand" />
            ))}
          <Link href="/" className="min-w-0 flex-1" title="Open the player">
            <p className="truncate text-sm font-semibold">{song.title}</p>
            <p className="truncate text-xs text-muted">{song.artist}</p>
          </Link>
          <button
            onClick={player.previous}
            disabled={!song.prev}
            aria-label="Previous song"
            className={controlClass}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M6 5h2v14H6V5zm3.5 7L19 5v14l-9.5-7z" />
            </svg>
          </button>
          <button
            onClick={player.togglePlay}
            aria-label={player.isPlaying ? "Pause" : "Play"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:scale-105 active:scale-95"
          >
            {player.isPlaying ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>
          <button
            onClick={player.next}
            disabled={!song.next}
            aria-label="Next song"
            className={controlClass}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M16 5h2v14h-2V5zM5 19V5l9.5 7L5 19z" />
            </svg>
          </button>
        </div>
        <div className="h-1 bg-foreground/10">
          <div
            className="h-full bg-accent transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {player.notice && (
          <p role="status" className="px-3 pb-2 pt-1 text-xs text-rose-600">
            {player.notice}
          </p>
        )}
      </section>
    </>
  );
}
