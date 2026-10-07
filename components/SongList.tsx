/* eslint-disable @next/next/no-img-element */
import { Song } from "@/lib/Song";
import { formatDuration } from "@/lib/format";

type Props = {
  songs: Song[];
  currentId: string | null;
  isPlaying: boolean;
  onSelect: (song: Song) => void;
  onRemove: (id: string) => void;
};

export default function SongList({
  songs,
  currentId,
  isPlaying,
  onSelect,
  onRemove,
}: Props) {
  return (
    <section className="rounded-3xl bg-surface/80 p-4 ring-1 ring-white/10 sm:p-6">
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
        <ul className="flex flex-col gap-1">
          {songs.map((song, index) => {
            const active = song.id === currentId;
            return (
              <li
                key={song.id}
                className={`group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
                  active
                    ? "bg-accent/20 ring-1 ring-accent/40"
                    : "hover:bg-white/5"
                }`}
              >
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
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                )}
                <button
                  onClick={() => onSelect(song)}
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
                  className="rounded-full p-2 text-muted transition hover:bg-white/10 hover:text-rose-300 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
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
      )}
    </section>
  );
}
