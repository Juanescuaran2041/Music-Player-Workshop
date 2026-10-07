/* eslint-disable @next/next/no-img-element */
import { Song } from "@/lib/Song";
import { formatDuration } from "@/lib/format";

type Props = {
  song: Song | null;
  position: number;
  total: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

const controlClass =
  "flex h-12 w-12 items-center justify-center rounded-full bg-foreground/10 text-foreground transition hover:bg-foreground/20 active:scale-90 disabled:opacity-30 disabled:hover:bg-foreground/10";

export default function NowPlaying({
  song,
  position,
  total,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onPrevious,
  onNext,
}: Props) {
  const canSeek = Boolean(song?.url || song?.videoId) && duration > 0;

  return (
    <section className="card overflow-hidden p-6">
      <div className="relative mx-auto aspect-square w-full max-w-72">
        <div
          className="vinyl disc-spin absolute inset-[6%] rounded-full shadow-2xl shadow-black/50"
          data-playing={isPlaying}
        >
          <div className="absolute inset-[32%] overflow-hidden rounded-full bg-brand ring-4 ring-black/60">
            {song?.cover ? (
              <img
                src={song.cover}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-1 text-center text-[0.6rem] font-bold leading-tight text-white/90">
                <span className="line-clamp-3">
                  {song ? song.title : "BloomMod"}
                </span>
              </div>
            )}
          </div>
          <div className="absolute left-1/2 top-1/2 h-[5%] w-[5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background ring-1 ring-white/30" />
        </div>
        <div className="vinyl-sheen pointer-events-none absolute inset-[6%] rounded-full" />
        <div className="tonearm" data-playing={isPlaying} aria-hidden="true">
          <span className="tonearm-head" />
        </div>
      </div>

      <div className="mt-6 min-h-16 text-center">
        <p className="truncate text-xl font-semibold">
          {song ? song.title : "Nothing playing"}
        </p>
        <p className="truncate text-muted">
          {song ? song.artist : "Add a song to get started"}
        </p>
        {song && (
          <p className="mt-1 text-xs text-muted">
            {position} of {total}
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-muted">
        <span className="w-9 text-right tabular-nums">
          {formatDuration(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(currentTime, duration || 1)}
          onChange={(e) => onSeek(Number(e.target.value))}
          disabled={!canSeek}
          aria-label="Seek"
          className="seek flex-1"
        />
        <span className="w-9 tabular-nums">
          {formatDuration(duration)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={onPrevious}
          disabled={!song?.prev}
          aria-label="Previous song"
          className={controlClass}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M6 5h2v14H6V5zm3.5 7L19 5v14l-9.5-7z" />
          </svg>
        </button>
        <button
          onClick={onTogglePlay}
          disabled={!song}
          aria-label={isPlaying ? "Pause" : "Play"}
          data-playing={isPlaying}
          className="play-glow flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-slate-900/10 transition hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
              <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>
        <button
          onClick={onNext}
          disabled={!song?.next}
          aria-label="Next song"
          className={controlClass}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M16 5h2v14h-2V5zM5 19V5l9.5 7L5 19z" />
          </svg>
        </button>
      </div>
    </section>
  );
}
