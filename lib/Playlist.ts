import { Song } from "./Song";

export class Playlist {
  head: Song | null = null;
  tail: Song | null = null;
  current: Song | null = null;
  size = 0;

  addFirst(song: Song): void {
    const new_song = song
    if (this.head === null){
      this.head = new_song
      this.tail = new_song
    }
    else{
      new_song.next = this.head
      this.head.prev = new_song
      this.head = new_song
    }
    this.size ++
  }

  addLast(song: Song): void {
    const new_song:Song = song

    if (this.head === null){
      this.head = new_song
      this.tail = new_song
    }
    else{
      new_song.prev = this.tail;
      this.tail!.next = new_song;
      this.tail = new_song;
    }
    this.size ++;

  }

  addAt(position: number, song: Song): void {
    if (position < 0 || position > this.size) {
      throw new Error("Invalid position");
    }

    if (position === 0) {
      this.addFirst(song);
      return;
    }

    if (position === this.size) {
      this.addLast(song);
      return;
    }

    const new_song:Song = song
    
    let prevNode = this.head!;

    for (let i = 0; i < position - 1; i++) {
      prevNode = prevNode.next!;
    }
    const after = prevNode.next!;

    new_song.prev = prevNode;
    new_song.next = after;
    prevNode.next = new_song;
    after.prev = new_song;

    this.size++;
   
  
  }

  remove(id: string): Song | null {
    let node = this.head;
    // Traverse the list to find the node with the given id
    while (node !== null && node.id !== id) {
      node = node.next;
    }
    if (node === null){
      return null;
    }

    // Update the prev Node's next pointer
    if (node.prev){
       node.prev.next = node.next;
    }
    else this.head = node.next

    // Update the next Node's prev pointer
    if (node.next){
      node.next.prev = node.prev;
    }
    else this.tail = node.prev;

    // Update the current pointer if it points to the removed node
    if (this.current === node){
      this.current = node.next;
    }
    
    //clear the pointers of the removed node
    node.prev = null;
    node.next = null;

    this.size--;
    return node;
  }

  previous(): Song | null {
    if (this.current?.prev){
      this.current = this.current.prev;
    }
    return this.current;
  }

  next(): Song | null {
    if (this.current?.next){
      this.current = this.current.next;
    }
    return this.current;
  }

  toArray(): Song[] {
    const songs: Song[] = [];
    for (let node = this.head; node !== null; node = node.next){
      songs.push(node)
    }
    return songs;
  }
}
