"use client";

import { usePlayer } from "./player/PlayerProvider";
import PlaylistsPanel from "./PlaylistsPanel";

export default function PlaylistsView() {
  const player = usePlayer();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section className="card-rise">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Your <span className="text-brand">playlists</span>
        </h1>
        <p className="mt-1 text-muted">
          Create playlists, save your queue and play them without leaving the page.
        </p>
      </section>
      <PlaylistsPanel
        playlists={player.playlists}
        queue={player.songs}
        onPlay={player.playPlaylist}
      />
    </div>
  );
}
