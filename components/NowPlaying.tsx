import { Song } from "@/lib/Song";

type Props = {
  song: Song | null;
  position: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
};

const controlClass =
  "flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-foreground transition hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10";

export default function NowPlaying({
  song,
  position,
  total,
  onPrevious,
  onNext,
}: Props) {
  return (
    <section className="rounded-3xl bg-surface/80 p-6 ring-1 ring-white/10">
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-linear-to-br from-accent to-pink-400 shadow-xl shadow-black/30">
        <svg
          viewBox="0 0 24 24"
          className="h-1/3 w-1/3 text-white/80"
          fill="currentColor"
        >
          <path d="M9 3v10.55A4 4 0 1 0 11 17V7h6V3H9z" />
        </svg>
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
