"use client";

import AddSongForm from "./AddSongForm";
import ImportAudio from "./ImportAudio";
import NowPlaying from "./NowPlaying";
import PlaylistsPanel from "./PlaylistsPanel";
import { usePlayer } from "./player/PlayerProvider";
import VideoSlot from "./player/VideoSlot";
import Recommendations from "./Recommendations";
import SearchSongs from "./SearchSongs";
import SongList from "./SongList";
import SourceBar from "./SourceBar";

export default function Player() {
  const player = usePlayer();

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-6">
        <NowPlaying
          song={player.current}
          position={player.position}
          total={player.songs.length}
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          onTogglePlay={player.togglePlay}
          onSeek={player.seek}
          onPrevious={player.previous}
          onNext={player.next}
        />
        <VideoSlot />
        {player.notice && (
          <p role="status" className="text-center text-sm text-rose-600">
            {player.notice}
          </p>
        )}
        <ImportAudio onFiles={player.importFiles} />
        <AddSongForm size={player.songs.length} onAdd={player.add} />
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <SourceBar
          source={player.source}
          connected={player.connected}
          onSourceChange={player.setSource}
        />
        <SearchSongs
          source={player.source}
          connected={player.connected}
          onAdd={player.addExternal}
          onPlay={player.playExternal}
          picker={player.picker}
        />
        <SongList
          songs={player.songs}
          currentId={player.current?.id ?? null}
          isPlaying={player.isPlaying}
          onSelect={player.select}
          onRemove={player.remove}
          onMove={player.move}
        />
        <PlaylistsPanel
          playlists={player.playlists}
          queue={player.songs}
          onPlay={player.playPlaylist}
        />
        <Recommendations
          source={player.source}
          connected={player.connected}
          seed={player.current}
          queue={player.songs}
          onAdd={player.addExternal}
          onPlay={player.playExternal}
          picker={player.picker}
        />
      </div>
    </div>
  );
}
