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

async function errorDetail(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body?.error?.message ?? "";
  } catch {
    return "";
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Starts a track on the browser player created with the Web Playback SDK
export async function playOnDevice(
  deviceId: string,
  uri: string,
): Promise<void> {
  const play = () =>
    spotifyFetch(`/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      body: JSON.stringify({ uris: [uri] }),
    });

  let response = await play();

  // Right after connecting, Spotify may not know the device yet and answers
  // 404. Transferring playback to it activates the device, then we retry.
  for (let attempt = 1; response.status === 404 && attempt <= 3; attempt++) {
    await spotifyFetch("/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [deviceId], play: false }),
    });
    await wait(600 * attempt);
    response = await play();
  }

  if (response.status === 403) {
    throw new SpotifyError("Spotify Premium is required to play full songs.");
  }
  if (!response.ok) {
    const detail = await errorDetail(response);
    throw new SpotifyError(
      `Spotify could not play this song (${response.status}${
        detail ? `: ${detail}` : ""
      }).`,
    );
  }
}
