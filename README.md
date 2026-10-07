# BloomMod

BloomMod is a web music player that plays songs from YouTube, Spotify and your own audio files, with sign-in and saved playlists.

## Data structures

### Doubly linked list: the playlist

Each playlist (`lib/Playlist.ts`) is a doubly linked list of songs. Every `Song` points to the previous and the next one, so you can skip forward and back, and add or remove songs at any position.

### Singly linked list: the library

The Library (`lib/Library.ts`) is a singly linked list of playlists. Each node holds one playlist and points to the next, to create, find, rename and delete the user's playlists.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
