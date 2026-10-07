/* eslint-disable @next/next/no-img-element */
"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { Song } from "@/lib/Song";
import { PlaylistResult, Playlists, PlaylistView } from "@/lib/usePlaylists";

type Props = {
  playlists: Playlists;
  queue: Song[];
  onPlay: (songs: Song[]) => void;
};

type Feedback = { ok: boolean; message: string } | null;

const iconButton =
  "rounded-full p-2 text-muted transition hover:bg-foreground/10 hover:text-accent-hover active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent";

export default function PlaylistsPanel({ playlists, queue, onPlay }: Props) {
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  function show(result: PlaylistResult) {
    setFeedback(result);
    return result.ok;
  }

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (show(playlists.create(name))) setName("");
  }

  function handleSaveQueue() {
    if (show(playlists.create(name, queue))) setName("");
  }

  return (
    <section className="card p-4 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">My playlists</h2>
        <span className="text-sm text-muted">
          {playlists.playlists.length} saved
        </span>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New playlist name"
          aria-label="New playlist name"
          maxLength={40}
          className="field min-w-40 flex-1"
        />
        <button type="submit" className="btn-primary shrink-0">
          Create
        </button>
        <button
          type="button"
          onClick={handleSaveQueue}
          disabled={queue.length === 0}
          title={queue.length === 0 ? "Your queue is empty" : undefined}
          className="btn-ghost shrink-0 disabled:opacity-40"
        >
          Save queue
        </button>
      </form>

      {/* Result of the last action, then any problem saving to Supabase */}
      {feedback && (
        <p
          role="status"
          className={`mt-3 text-sm ${feedback.ok ? "text-emerald-600" : "text-rose-600"}`}
        >
          {feedback.message}
        </p>
      )}
      {playlists.error && (
        <p role="alert" className="mt-3 text-sm text-rose-600">
          {playlists.error}
        </p>
      )}

      {playlists.loading ? (
        <p className="py-8 text-center text-muted">Loading your playlists...</p>
      ) : playlists.playlists.length === 0 ? (
        <p className="py-8 text-center text-muted">
          No playlists yet. Create one or save your queue.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {playlists.playlists.map((playlist, index) => (
            <PlaylistItem
              key={playlist.id}
              playlist={playlist}
              index={index}
              open={openId === playlist.id}
              onToggle={() =>
                setOpenId(openId === playlist.id ? null : playlist.id)
              }
              onPlay={() => onPlay(playlist.songs)}
              onRename={(newName) =>
                show(playlists.rename(playlist.id, newName))
              }
              onDelete={() => show(playlists.remove(playlist.id))}
              onRemoveSong={(songId) =>
                playlists.removeSong(playlist.id, songId)
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}

type ItemProps = {
  playlist: PlaylistView;
  index: number;
  open: boolean;
  onToggle: () => void;
  onPlay: () => void;
  onRename: (name: string) => boolean;
  onDelete: () => void;
  onRemoveSong: (songId: string) => void;
};

function PlaylistItem({
  playlist,
  index,
  open,
  onToggle,
  onPlay,
  onRename,
  onDelete,
  onRemoveSong,
}: ItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(playlist.name);
  const [confirming, setConfirming] = useState(false);
  const count = playlist.songs.length;
  const cover = playlist.songs.find((song) => song.cover)?.cover;

  function startEditing() {
    setDraft(playlist.name);
    setEditing(true);
  }

  function save() {
    if (draft.trim() === playlist.name || onRename(draft)) setEditing(false);
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") save();
    if (event.key === "Escape") setEditing(false);
  }

  return (
    <li
      style={{ animationDelay: `${index * 40}ms` }}
      className="result-in rounded-xl ring-1 ring-foreground/10 transition-colors hover:bg-foreground/5"
    >
      <div className="flex items-center gap-3 p-2">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-12 shrink-0 rounded-lg bg-brand" />
        )}

        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            onBlur={save}
            maxLength={40}
            aria-label="Playlist name"
            className="field min-w-0 flex-1 py-2"
          />
        ) : (
          <button
            onClick={onToggle}
            aria-expanded={open}
            className="min-w-0 flex-1 text-left"
          >
            <p className="truncate font-medium">{playlist.name}</p>
            <p className="text-xs text-muted">
              {count} {count === 1 ? "song" : "songs"}
            </p>
          </button>
        )}

        <button
          onClick={onPlay}
          disabled={count === 0}
          aria-label={`Play ${playlist.name}`}
          title="Play (replaces the queue)"
          className={iconButton}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        </button>
        <button
          onClick={startEditing}
          aria-label={`Rename ${playlist.name}`}
          className={iconButton}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
        {confirming ? (
          <button
            onClick={onDelete}
            onBlur={() => setConfirming(false)}
            autoFocus
            className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
          >
            Delete?
          </button>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${playlist.name}`}
            className={`${iconButton} hover:text-rose-600`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-foreground/10 px-2 py-2">
          {count === 0 ? (
            <p className="py-3 text-center text-sm text-muted">
              Empty. Use the playlist button on a search result to add songs.
            </p>
          ) : (
            <ol className="flex flex-col">
              {playlist.songs.map((song, position) => (
                <li
                  key={song.id}
                  className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-foreground/5"
                >
                  <span className="w-5 text-right text-xs text-muted">
                    {position + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{song.title}</p>
                    <p className="truncate text-xs text-muted">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => onRemoveSong(song.id)}
                    aria-label={`Remove ${song.title} from ${playlist.name}`}
                    className="rounded-full p-1.5 text-muted transition hover:bg-foreground/10 hover:text-rose-600 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
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
              ))}
            </ol>
          )}
        </div>
      )}
    </li>
  );
}
