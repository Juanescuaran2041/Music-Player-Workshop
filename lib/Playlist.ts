import { Song } from "./Song";

export class Playlist {
  head: Song | null = null;
  tail: Song | null = null;
  current: Song | null = null;
  size = 0;

  addFirst(song: Song): void {
    throw new Error("Not implemented");
  }

  addLast(song: Song): void {
    throw new Error("Not implemented");
  }

  addAt(position: number, song: Song): void {
    throw new Error("Not implemented");
  }

  remove(id: string): Song | null {
    throw new Error("Not implemented");
  }

  next(): Song | null {
    throw new Error("Not implemented");
  }

  previous(): Song | null {
    throw new Error("Not implemented");
  }

  toArray(): Song[] {
    throw new Error("Not implemented");
  }
}
