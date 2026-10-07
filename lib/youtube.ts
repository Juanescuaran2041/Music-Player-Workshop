import { Song } from "./Song";

export type Track = {
  videoId: string;
  title: string;
  artist: string;
  cover: string;
};

type SearchItem = {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: Record<string, { url: string } | undefined>;
  };
};

export class YouTubeError extends Error {}

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const CACHE_PREFIX = "orbitune:yt:";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const inflight = new Map<string, Promise<Track[]>>();

function decodeEntities(text: string): string {
  const doc = new DOMParser().parseFromString(text, "text/html");
  return doc.documentElement.textContent ?? text;
}

function parseTrack(item: SearchItem): Track {
  const channel = decodeEntities(item.snippet.channelTitle)
    .replace(/\s*-\s*Topic$/i, "")
    .replace(/VEVO$/i, "")
    .trim();
  const cleaned = decodeEntities(item.snippet.title)
    .replace(
      /\s*[(\[][^)\]]*(official|video|audio|lyric|visualizer|hd|4k|mv)[^)\]]*[)\]]/gi,
      "",
    )
    .trim();

  // "Artist - Song" is the usual format for music uploads
  const split = cleaned.indexOf(" - ");
  const thumbs = item.snippet.thumbnails;

  return {
    videoId: item.id.videoId,
    title: split > 0 ? cleaned.slice(split + 3) : cleaned,
    artist: split > 0 ? cleaned.slice(0, split) : channel,
    cover: (thumbs.high ?? thumbs.medium ?? thumbs.default)?.url ?? "",
  };
}

function readCache(key: string): Track[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { at, tracks } = JSON.parse(raw);
    return Date.now() - at < CACHE_TTL_MS ? tracks : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, tracks: Track[]) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ at: Date.now(), tracks }),
    );
  } catch {
    // storage full or unavailable: caching is optional
  }
}

async function requestTracks(query: string): Promise<Track[]> {
  if (!API_KEY) {
    throw new YouTubeError("Missing NEXT_PUBLIC_YOUTUBE_API_KEY in .env");
  }

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoCategoryId: "10",
    videoEmbeddable: "true",
    maxResults: "12",
    q: query,
    key: API_KEY,
  });
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const reason = body?.error?.errors?.[0]?.reason;
    throw new YouTubeError(
      reason === "quotaExceeded"
        ? "Daily YouTube quota reached. Try again tomorrow."
        : "YouTube search failed. Check the API key.",
    );
  }

  const data: { items: SearchItem[] } = await response.json();
  return data.items.filter((item) => item.id?.videoId).map(parseTrack);
}

// Searches cost quota, so results are cached and concurrent calls are shared.
export function searchTracks(query: string): Promise<Track[]> {
  const key = query.trim().toLowerCase();
  const cached = readCache(key);
  if (cached) return Promise.resolve(cached);

  let pending = inflight.get(key);
  if (!pending) {
    pending = requestTracks(query)
      .then((tracks) => {
        writeCache(key, tracks);
        return tracks;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  return pending;
}

// Duration is unknown until the player loads the video
export function trackToSong(track: Track): Song {
  return new Song(
    crypto.randomUUID(),
    track.title,
    track.artist,
    0,
    "",
    track.cover,
    track.videoId,
  );
}
