/* eslint-disable @next/next/no-img-element */
import { Song } from "@/lib/Song";

type Props = {
  songs: Song[];
  onAdd: (song: Song) => void;
  onPlay: (song: Song) => void;
};

const iconButton =
  "rounded-full p-2 text-muted transition hover:bg-foreground/10 hover:text-accent-hover active:scale-90";

export default function SongResultList({ songs, onAdd, onPlay }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {songs.map((song, index) => (
        <li
          key={song.id}
          style={{ animationDelay: `${index * 40}ms` }}
          className="result-in group flex min-w-0 items-center gap-3 rounded-xl p-2 transition hover:-translate-y-0.5 hover:bg-foreground/5"
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
        </li>
      ))}
    </ul>
  );
}
