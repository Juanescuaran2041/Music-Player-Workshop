/* eslint-disable @next/next/no-img-element */
import { Song } from "@/lib/Song";

type Props = {
  songs: Song[];
  onAdd: (song: Song) => void;
  onPlay: (song: Song) => void;
};

const iconButton =
  "rounded-full p-2 text-muted transition hover:bg-white/10 hover:text-accent-hover";

export default function SongResultList({ songs, onAdd, onPlay }: Props) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {songs.map((song) => (
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
        </li>
      ))}
    </ul>
  );
}
