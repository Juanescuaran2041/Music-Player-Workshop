"use client";

import { useEffect, useRef, useState } from "react";
import { getAudioDuration } from "@/lib/audio";
import { songSourceId, Source } from "@/lib/music";
import { Playlist } from "@/lib/Playlist";
import { QueueStorage } from "@/lib/QueueStorage";
import { Song } from "@/lib/Song";
import { usePlayTracker } from "@/lib/stats/usePlayTracker";
import { youtubeErrorMessage } from "@/lib/youtubePlayer";
import { useSpotifyConnected } from "@/lib/spotify/auth";
import { usePlaylists } from "@/lib/usePlaylists";
import AddSongForm, { Placement } from "./AddSongForm";
import ImportAudio from "./ImportAudio";
import NowPlaying from "./NowPlaying";
import PlaylistsPanel from "./PlaylistsPanel";
import Recommendations from "./Recommendations";
import SearchSongs from "./SearchSongs";
import SongList from "./SongList";
import SourceBar from "./SourceBar";
import SpotifyPlayer, { SpotifyPlayerHandle } from "./SpotifyPlayer";
import YouTubeEmbed, { YouTubeEmbedHandle } from "./YouTubeEmbed";

export default function Player() {
  const playlistRef = useRef(new Playlist());
  const queueStorageRef = useRef(new QueueStorage());
  const lastCurrentRef = useRef<Song | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const embedRef = useRef<YouTubeEmbedHandle>(null);
  const spotifyRef = useRef<SpotifyPlayerHandle>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [current, setCurrent] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [source, setSource] = useState<Source>("youtube");
  const connected = useSpotifyConnected();
  const [notice, setNotice] = useState("");
  const playlists = usePlaylists();
  const picker = {
    playlists: playlists.playlists,
    onAdd: playlists.addSong,
  };
  usePlayTracker(current, currentTime, isPlaying);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (current?.url && isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, current]);

  useEffect(() => {
    playlistRef.current = queueStorageRef.current.load();
    sync();
  }, []);

  function sync() {
    const playlist = playlistRef.current;
    queueStorageRef.current.save(playlist);
    setSongs(playlist.toArray());
    setCurrent(playlist.current);

    if (playlist.current !== lastCurrentRef.current) {
      lastCurrentRef.current = playlist.current;
      setCurrentTime(0);
      setStreamDuration(0);
      setNotice("");
    }
  }

  function enqueue(song: Song, placement: Placement, position = 1) {
    const playlist = playlistRef.current;
    if (placement === "start") playlist.addFirst(song);
    else if (placement === "end") playlist.addLast(song);
    else playlist.addAt(position - 1, song);

    if (playlist.current === null) playlist.current = playlist.head;
  }

  // Search results are shared objects, so the queue gets its own copy
  function copyOf(song: Song): Song {
    return new Song(
      crypto.randomUUID(),
      song.title,
      song.artist,
      song.duration,
      song.url,
      song.cover,
      song.videoId,
      song.spotifyUri,
    );
  }

  function handleAdd(song: Song, placement: Placement, position: number) {
    enqueue(song, placement, position);
    sync();
  }

  async function handleImport(files: File[]) {
    for (const file of files) {
      const url = URL.createObjectURL(file);
      try {
        const duration = await getAudioDuration(url);
        const title = file.name.replace(/\.[^.]+$/, "");
        enqueue(
          new Song(crypto.randomUUID(), title, "Unknown artist", duration, url),
          "end",
        );
      } catch {
        URL.revokeObjectURL(url);
      }
    }
    sync();
  }

  function handleRemove(id: string) {
    const removed = playlistRef.current.remove(id);
    if (removed?.url.startsWith("blob:")) URL.revokeObjectURL(removed.url);
    if (playlistRef.current.current === null) setIsPlaying(false);
    sync();
  }

  // Moves a song to a new position without changing which song is current
  function handleMove(id: string, toIndex: number) {
    const playlist = playlistRef.current;
    const current = playlist.current;
    const moved = playlist.remove(id);
    if (!moved) return;

    playlist.addAt(toIndex, moved);
    playlist.current = current;
    sync();
  }

  function handleSelect(song: Song) {
    playlistRef.current.current = song;
    setIsPlaying(true);
    sync();
  }

  // The same Spotify/YouTube track should only appear once in the queue
  function findQueued(song: Song): Song | undefined {
    const id = songSourceId(song);
    return id
      ? playlistRef.current.toArray().find((s) => songSourceId(s) === id)
      : undefined;
  }

  function handleExternalAdd(song: Song) {
    if (findQueued(song)) {
      setNotice("That song is already in your queue.");
      return;
    }
    enqueue(copyOf(song), "end");
    sync();
  }

  function handleExternalPlay(song: Song) {
    const queued = findQueued(song);
    if (queued) {
      handleSelect(queued);
      return;
    }
    const copy = copyOf(song);
    enqueue(copy, "end");
    handleSelect(copy);
  }

  // Replaces the queue with a saved playlist and starts from its first song
  function handlePlayPlaylist(saved: Song[]) {
    if (saved.length === 0) return;
    for (const song of playlistRef.current.toArray()) {
      if (song.url.startsWith("blob:")) URL.revokeObjectURL(song.url);
    }

    // The saved songs are nodes of the playlist's own list, so the queue
    // gets copies instead of relinking them
    const queue = new Playlist();
    for (const song of saved) queue.addLast(copyOf(song));
    queue.current = queue.head;
    playlistRef.current = queue;
    setIsPlaying(true);
    sync();
  }

  function handleNext() {
    playlistRef.current.next();
    sync();
  }

  function handlePrevious() {
    playlistRef.current.previous();
    sync();
  }

  function handleEnded() {
    if (current?.next) handleNext();
    else setIsPlaying(false);
  }

  function handleEmbedError(code: number) {
    const skipping = Boolean(current?.next);
    if (skipping) handleNext();
    else setIsPlaying(false);
    setNotice(
      `${youtubeErrorMessage(code)}${skipping ? " Skipping to the next song." : ""}`,
    );
  }

  function handlePlayerError(message: string) {
    setIsPlaying(false);
    setNotice(message);
  }

  function handleSeek(seconds: number) {
    if (current?.spotifyUri) spotifyRef.current?.seek(seconds);
    else if (current?.videoId) embedRef.current?.seek(seconds);
    else if (audioRef.current) audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }

  const position = current ? songs.indexOf(current) + 1 : 0;
  const streamed = Boolean(current?.videoId || current?.spotifyUri);
  const duration = streamed
    ? streamDuration || (current?.duration ?? 0)
    : (current?.duration ?? 0);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <audio
        ref={audioRef}
        src={current?.url || undefined}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={handleEnded}
      />
      <div className="flex min-w-0 flex-col gap-6">
        <NowPlaying
          song={current}
          position={position}
          total={songs.length}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSeek={handleSeek}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
        <YouTubeEmbed
          ref={embedRef}
          videoId={current?.videoId || null}
          isPlaying={isPlaying}
          onPlayingChange={setIsPlaying}
          onTime={setCurrentTime}
          onDuration={setStreamDuration}
          onEnded={handleEnded}
          onError={handleEmbedError}
        />
        <SpotifyPlayer
          ref={spotifyRef}
          connected={connected}
          uri={current?.spotifyUri || null}
          isPlaying={isPlaying}
          onTime={setCurrentTime}
          onDuration={setStreamDuration}
          onEnded={handleEnded}
          onError={handlePlayerError}
        />
        {notice && (
          <p role="status" className="text-center text-sm text-rose-600">
            {notice}
          </p>
        )}
        <ImportAudio onFiles={handleImport} />
        <AddSongForm size={songs.length} onAdd={handleAdd} />
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <SourceBar
          source={source}
          connected={connected}
          onSourceChange={setSource}
        />
        <SearchSongs
          source={source}
          connected={connected}
          onAdd={handleExternalAdd}
          onPlay={handleExternalPlay}
          picker={picker}
        />
        <SongList
          songs={songs}
          currentId={current?.id ?? null}
          isPlaying={isPlaying}
          onSelect={handleSelect}
          onRemove={handleRemove}
          onMove={handleMove}
        />
        <PlaylistsPanel
          playlists={playlists}
          queue={songs}
          onPlay={handlePlayPlaylist}
        />
        <Recommendations
          source={source}
          connected={connected}
          seed={current}
          queue={songs}
          onAdd={handleExternalAdd}
          onPlay={handleExternalPlay}
          picker={picker}
        />
      </div>
    </div>
  );
}
