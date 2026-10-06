"use client";

import { useRef, useState } from "react";
import { Playlist } from "@/lib/Playlist";
import { Song } from "@/lib/Song";
import AddSongForm, { Placement } from "./AddSongForm";
import NowPlaying from "./NowPlaying";
import SongList from "./SongList";

export default function Player() {
  const playlistRef = useRef(new Playlist());
  const [songs, setSongs] = useState<Song[]>([]);
  const [current, setCurrent] = useState<Song | null>(null);

  function sync() {
    setSongs(playlistRef.current.toArray());
    setCurrent(playlistRef.current.current);
  }

  function handleAdd(song: Song, placement: Placement, position: number) {
    const playlist = playlistRef.current;
    if (placement === "start") playlist.addFirst(song);
    else if (placement === "end") playlist.addLast(song);
    else playlist.addAt(position - 1, song);

    if (playlist.current === null) playlist.current = playlist.head;
    sync();
  }

  function handleRemove(id: string) {
    playlistRef.current.remove(id);
    sync();
  }

  function handleSelect(song: Song) {
    playlistRef.current.current = song;
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

  const position = current ? songs.indexOf(current) + 1 : 0;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
      <div className="flex flex-col gap-6">
        <NowPlaying
          song={current}
          position={position}
          total={songs.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
        <AddSongForm size={songs.length} onAdd={handleAdd} />
      </div>
      <SongList
        songs={songs}
        currentId={current?.id ?? null}
        onSelect={handleSelect}
        onRemove={handleRemove}
      />
    </div>
  );
}
