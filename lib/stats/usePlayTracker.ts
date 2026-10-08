import { useEffect, useRef } from "react";
import { Song } from "../Song";
import { GenreResolver } from "./GenreResolver";
import { PlayHistoryRepository } from "./PlayHistoryRepository";
import { PlayTracker } from "./PlayTracker";

export function usePlayTracker(
  song: Song | null,
  currentTime: number,
  isPlaying: boolean,
): void {
  const trackerRef = useRef<PlayTracker | null>(null);

  useEffect(() => {
    trackerRef.current ??= new PlayTracker(
      new PlayHistoryRepository(),
      new GenreResolver(),
    );
    trackerRef.current.update(song, currentTime, isPlaying);
  }, [song, currentTime, isPlaying]);

  useEffect(() => {
    const flush = () => trackerRef.current?.flush();
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);
}
