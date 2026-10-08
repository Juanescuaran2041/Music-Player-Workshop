"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getAudioDuration } from "@/lib/audio";
import { songSourceId, Source } from "@/lib/music";
import { Playlist } from "@/lib/Playlist";
import { QueueStorage } from "@/lib/QueueStorage";
import { Song } from "@/lib/Song";
import { useSpotifyConnected } from "@/lib/spotify/auth";
import { usePlayTracker } from "@/lib/stats/usePlayTracker";
import { Playlists, usePlaylists } from "@/lib/usePlaylists";
import { youtubeErrorMessage } from "@/lib/youtubePlayer";
import { Placement } from "../AddSongForm";
import { PlaylistPicker } from "../SongResultList";
import SpotifyPlayer, { SpotifyPlayerHandle } from "../SpotifyPlayer";
import YouTubeEmbed, { YouTubeEmbedHandle } from "../YouTubeEmbed";
import VideoDock from "./VideoDock";

type PlayerContextValue = {
  songs: Song[];
  current: Song | null;
  position: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  source: Source;
  connected: boolean;
  notice: string;
  playlists: Playlists;
  picker: PlaylistPicker;
  setSource: (source: Source) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  next: () => void;
  previous: () => void;
  add: (song: Song, placement: Placement, position: number) => void;
  importFiles: (files: File[]) => Promise<void>;
  remove: (id: string) => void;
  move: (id: string, toIndex: number) => void;
  select: (song: Song) => void;
  addExternal: (song: Song) => void;
  playExternal: (song: Song) => void;
  playPlaylist: (songs: Song[]) => void;
  registerVideoSlot: (slot: HTMLElement) => void;
  releaseVideoSlot: (slot: HTMLElement) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const player = useContext(PlayerContext);
  if (!player) throw new Error("usePlayer must be used inside PlayerProvider");
  return player;
}

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

function isBlob(song: Song): boolean {
  return song.url.startsWith("blob:");
}

export default function PlayerProvider({ children }: { children: ReactNode }) {
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
  const [notice, setNotice] = useState("");
  const [videoSlot, setVideoSlot] = useState<HTMLElement | null>(null);
  const connected = useSpotifyConnected();
  const playlists = usePlaylists();
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

  const registerVideoSlot = useCallback(
    (slot: HTMLElement) => setVideoSlot(slot),
    [],
  );
  const releaseVideoSlot = useCallback(
    (slot: HTMLElement) =>
      setVideoSlot((active) => (active === slot ? null : active)),
    [],
  );

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

  function add(song: Song, placement: Placement, position: number) {
    enqueue(song, placement, position);
    sync();
  }

  async function importFiles(files: File[]) {
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

  function remove(id: string) {
    const removed = playlistRef.current.remove(id);
    if (removed && isBlob(removed)) URL.revokeObjectURL(removed.url);
    if (playlistRef.current.current === null) setIsPlaying(false);
    sync();
  }

  function move(id: string, toIndex: number) {
    const playlist = playlistRef.current;
    const active = playlist.current;
    const moved = playlist.remove(id);
    if (!moved) return;

    playlist.addAt(toIndex, moved);
    playlist.current = active;
    sync();
  }

  function select(song: Song) {
    playlistRef.current.current = song;
    setIsPlaying(true);
    sync();
  }

  function findQueued(song: Song): Song | undefined {
    const id = songSourceId(song);
    return id
      ? playlistRef.current.toArray().find((s) => songSourceId(s) === id)
      : undefined;
  }

  function addExternal(song: Song) {
    if (findQueued(song)) {
      setNotice("That song is already in your queue.");
      return;
    }
    enqueue(copyOf(song), "end");
    sync();
  }

  function playExternal(song: Song) {
    const queued = findQueued(song);
    if (queued) {
      select(queued);
      return;
    }
    const copy = copyOf(song);
    enqueue(copy, "end");
    select(copy);
  }

  function playPlaylist(saved: Song[]) {
    if (saved.length === 0) return;
    for (const song of playlistRef.current.toArray()) {
      if (isBlob(song)) URL.revokeObjectURL(song.url);
    }

    const queue = new Playlist();
    for (const song of saved) queue.addLast(copyOf(song));
    queue.current = queue.head;
    playlistRef.current = queue;
    setIsPlaying(true);
    sync();
  }

  function next() {
    playlistRef.current.next();
    sync();
  }

  function previous() {
    playlistRef.current.previous();
    sync();
  }

  function handleEnded() {
    if (current?.next) next();
    else setIsPlaying(false);
  }

  function handleEmbedError(code: number) {
    const skipping = Boolean(current?.next);
    if (skipping) next();
    else setIsPlaying(false);
    setNotice(
      `${youtubeErrorMessage(code)}${skipping ? " Skipping to the next song." : ""}`,
    );
  }

  function handlePlayerError(message: string) {
    setIsPlaying(false);
    setNotice(message);
  }

  function seek(seconds: number) {
    if (current?.spotifyUri) spotifyRef.current?.seek(seconds);
    else if (current?.videoId) embedRef.current?.seek(seconds);
    else if (audioRef.current) audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }

  const streamed = Boolean(current?.videoId || current?.spotifyUri);
  const duration = streamed
    ? streamDuration || (current?.duration ?? 0)
    : (current?.duration ?? 0);

  const value: PlayerContextValue = {
    songs,
    current,
    position: current ? songs.indexOf(current) + 1 : 0,
    isPlaying,
    currentTime,
    duration,
    source,
    connected,
    notice,
    playlists,
    picker: { playlists: playlists.playlists, onAdd: playlists.addSong },
    setSource,
    togglePlay: () => setIsPlaying(!isPlaying),
    seek,
    next,
    previous,
    add,
    importFiles,
    remove,
    move,
    select,
    addExternal,
    playExternal,
    playPlaylist,
    registerVideoSlot,
    releaseVideoSlot,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={current?.url || undefined}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={handleEnded}
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
      <VideoDock slot={videoSlot}>
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
      </VideoDock>
    </PlayerContext.Provider>
  );
}
