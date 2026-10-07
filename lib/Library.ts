
import { Playlist } from "./Playlist";

export class LibraryNode {
  next: LibraryNode | null = null;
  playlist: Playlist = new Playlist();

  constructor(
    public id: string,
    public name: string,
  ) {}
}

export class Library {
  head: LibraryNode | null = null;
  tail: LibraryNode | null = null;
  size = 0;

  // creates a new node at the end of the singly linked list
  create(id: string, name: string): LibraryNode {
    
    const new_node = new LibraryNode(id, name);

    if (this.size === 0){
      this.head = new_node;
      this.tail = new_node;
    } else {
      this.tail!.next = new_node;
      this.tail = new_node;
    }
    this.size++;

    return new_node;
  }

  // searches for a node by id
  find(id: string): LibraryNode | null {
    
    let current = this.head;
    
    while (current !== null) {
      if (current.id === id) {
        return current;
      }
      current = current.next;
    }

    return null;
  }
  // searches for a node by name, ignoring case and whitespace
  findByName(name: string): LibraryNode | null {
    let current = this.head;
    const targetName = name.trim().toLowerCase();

    while (current !== null) {
      if (current.name.trim().toLowerCase() === targetName) {
        return current;
      }
      current = current.next;
    }

    return null;
  }

  rename(id: string, name: string): boolean {
    const songNode = this.find(id);
    
    if (songNode) {
      songNode.name = name;
      return true;
    }

    return false;
  }

  //removes a node from the singly linked list
  remove(id: string): LibraryNode | null {
    let prev: LibraryNode | null = null;
    let current = this.head;

    while (current !== null) {
      if (current.id === id){
        //evaluate if the node to be removed is the head or tail and update pointers
        if (prev === null) {
          this.head = current.next;
        } else {
          prev.next = current.next;
        }
        // if the current node is the tail, the prev node becomes the new tail
        if (current === this.tail) {
          this.tail = prev;
        }
        // disconnect the removed node from the list
        current.next = null; 
        this.size--;
        return current;
      }
      //increments 
      prev = current;
      current = current.next;
    }
    
    return null;
  }

  // returns an array of all nodes
  toArray(): LibraryNode[] {
    const nodes: LibraryNode[] = [];
    let current = this.head;

    while (current !== null){
      nodes.push(current);
      current = current.next;
    }

    return nodes;

  }
}
