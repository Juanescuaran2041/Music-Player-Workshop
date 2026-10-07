/* eslint-disable @typescript-eslint/no-unused-vars --
   The methods below are stubs. Remove this line once they are implemented. */
import { Playlist } from "./Playlist";

// One saved playlist inside the library. Each node holds its own doubly
// linked list of songs (Playlist) and points to the next playlist.
export class LibraryNode {
  next: LibraryNode | null = null;
  playlist: Playlist = new Playlist();

  constructor(
    public id: string,
    public name: string,
  ) {}
}

// Singly linked list with every saved playlist of the user, in the order
// they were created. The app only walks it forwards, so nodes do not need a
// prev pointer.
export class Library {
  head: LibraryNode | null = null;
  tail: LibraryNode | null = null;
  size = 0;

  // Creates a playlist with this id and name and links it at the END of the
  // list, then returns the new node.
  // - Empty list: head and tail both point to the new node.
  // - Otherwise: the current tail points to it and it becomes the new tail.
  // - Do not forget to update size.
  create(id: string, name: string): LibraryNode {
    // TODO: implement. For now the node is returned but never linked.
    return new LibraryNode(id, name);
  }

  // Walks the list from head and returns the node with this id, or null when
  // there is none.
  find(id: string): LibraryNode | null {
    // TODO: implement
    return null;
  }

  // Same as find, but by name and ignoring upper/lower case, so the app can
  // stop the user from creating "Rock" twice ("rock" counts as the same).
  // Tip: name.trim().toLowerCase()
  findByName(name: string): LibraryNode | null {
    // TODO: implement
    return null;
  }

  // Changes the name of the playlist with this id. Returns true when it was
  // found and renamed, false otherwise. You can reuse find().
  rename(id: string, name: string): boolean {
    // TODO: implement
    return false;
  }

  // Unlinks the playlist with this id and returns it, or null when there is
  // none. In a singly linked list you need the node BEFORE the one you remove.
  // Cases to cover:
  // - Removing the head: head moves to the next node.
  // - Removing the tail: tail moves to the node before it.
  // - Removing the only node: head and tail become null.
  // - Removing from the middle: the node before skips over it.
  // Clear the removed node's next pointer and update size.
  remove(id: string): LibraryNode | null {
    // TODO: implement
    return null;
  }

  // Returns every node from head to tail as an array, so the interface can
  // draw them. Same idea as Playlist.toArray().
  toArray(): LibraryNode[] {
    // TODO: implement
    return [];
  }
}
