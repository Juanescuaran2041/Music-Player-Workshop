import { Playlist } from "./Playlist";
import { canSave, fromStored, StoredSong, toStored } from "./playlists";

type StoredQueue = {
  songs: StoredSong[];
  currentIndex: number;
};

export class QueueStorage {
  private static readonly KEY = "bloommod:queue";

  save(playlist: Playlist): void {
    const songs = playlist.toArray().filter(canSave);
    const queue: StoredQueue = {
      songs: songs.map(toStored),
      currentIndex: playlist.current ? songs.indexOf(playlist.current) : -1,
    };
    try {
      sessionStorage.setItem(QueueStorage.KEY, JSON.stringify(queue));
    } catch {
      return;
    }
  }

  load(): Playlist {
    const playlist = new Playlist();
    const queue = this.read();
    if (!queue) return playlist;

    const songs = queue.songs.map(fromStored);
    for (const song of songs) playlist.addLast(song);
    playlist.current = songs[queue.currentIndex] ?? playlist.head;
    return playlist;
  }

  private read(): StoredQueue | null {
    try {
      const raw = sessionStorage.getItem(QueueStorage.KEY);
      return raw ? (JSON.parse(raw) as StoredQueue) : null;
    } catch {
      return null;
    }
  }
}
