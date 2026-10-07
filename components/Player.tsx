"use client";

import { useEffect, useRef, useState } from "react";
import { getAudioDuration } from "@/lib/audio";
import { Playlist } from "@/lib/Playlist";
import { Song } from "@/lib/Song";
import AddSongForm, { Placement } from "./AddSongForm";
import ImportAudio from "./ImportAudio";
import NowPlaying from "./NowPlaying";
import SongList from "./SongList";

export default function Player() {
  const playlistRef = useRef(new Playlist());
  const audioRef = useRef<HTMLAudioElement>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [current, setCurrent] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current?.url) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, current]);

  function sync() {
    setSongs(playlistRef.current.toArray());
    setCurrent(playlistRef.current.current);
    setCurrentTime(0);
  }

  function enqueue(song: Song, placement: Placement, position = 1) {
    const playlist = playlistRef.current;
    if (placement === "start") playlist.addFirst(song);
    else if (placement === "end") playlist.addLast(song);
    else playlist.addAt(position - 1, song);

    if (playlist.current === null) playlist.current = playlist.head;
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

  function handleSelect(song: Song) {
    playlistRef.current.current = song;
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

  function handleSeek(seconds: number) {
    if (audioRef.current) audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }

  const position = current ? songs.indexOf(current) + 1 : 0;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
      <audio
        ref={audioRef}
        src={current?.url || undefined}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={handleEnded}
      />
      <div className="flex flex-col gap-6">
        <NowPlaying
          song={current}
          position={position}
          total={songs.length}
          isPlaying={isPlaying}
          currentTime={currentTime}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSeek={handleSeek}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
        <ImportAudio onFiles={handleImport} />
        <AddSongForm size={songs.length} onAdd={handleAdd} />
      </div>
      <SongList
        songs={songs}
        currentId={current?.id ?? null}
        isPlaying={isPlaying}
        onSelect={handleSelect}
        onRemove={handleRemove}
      />
    </div>
  );
}
