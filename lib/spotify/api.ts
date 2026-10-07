import { Song } from "../Song";
import { disconnectSpotify, getAccessToken, SpotifyError } from "./auth";

type SpotifyTrack = {
  uri: string;
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: { images: { url: string }[] };
};

async function spotifyFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    disconnectSpotify();
    throw new SpotifyError("Spotify session expired. Connect again.");
  }
  if (response.status === 429) {
    throw new SpotifyError("Spotify is busy. Try again in a moment.");
  }
  return response;
}

export async function searchSpotify(query: string): Promise<Song[]> {
  const params = new URLSearchParams({ q: query, type: "track", limit: "10" });
  const response = await spotifyFetch(`/search?${params}`);
  if (!response.ok) {
    throw new SpotifyError(`Spotify search failed (${response.status}).`);
  }

  const data: { tracks: { items: (SpotifyTrack | null)[] } } =
    await response.json();
  return data.tracks.items
    .filter((track): track is SpotifyTrack => track !== null)
    .map(
      (track) =>
        new Song(
          crypto.randomUUID(),
          track.name,
          track.artists.map((artist) => artist.name).join(", "),
          Math.round(track.duration_ms / 1000),
          "",
          track.album.images[0]?.url ?? "",
          "",
          track.uri,
        ),
    );
}

// Starts a track on the browser player created with the Web Playback SDK
export async function playOnDevice(
  deviceId: string,
  uri: string,
): Promise<void> {
  const request = () =>
    spotifyFetch(`/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      body: JSON.stringify({ uris: [uri] }),
    });

  let response = await request();
  if (response.status === 404) {
    // the device can take a moment to register right after connecting
    await new Promise((resolve) => setTimeout(resolve, 800));
    response = await request();
  }
  if (response.status === 403) {
    throw new SpotifyError("Spotify Premium is required to play full songs.");
  }
  if (!response.ok) {
    throw new SpotifyError(`Spotify could not play this song (${response.status}).`);
  }
}
