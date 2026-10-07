export type SpotifyState = {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: { uri: string };
    previous_tracks: { uri: string }[];
  };
};

type SpotifyMessage = { message: string };

export type SpotifyPlayer = {
  connect(): Promise<boolean>;
  disconnect(): void;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  getCurrentState(): Promise<SpotifyState | null>;
  addListener(
    event: "ready" | "not_ready",
    callback: (data: { device_id: string }) => void,
  ): boolean;
  addListener(
    event:
      | "initialization_error"
      | "authentication_error"
      | "account_error"
      | "playback_error",
    callback: (data: SpotifyMessage) => void,
  ): boolean;
  addListener(
    event: "player_state_changed",
    callback: (state: SpotifyState | null) => void,
  ): boolean;
};

type SpotifyNamespace = {
  Player: new (options: {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume: number;
  }) => SpotifyPlayer;
};

declare global {
  interface Window {
    Spotify?: SpotifyNamespace;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

let sdkPromise: Promise<SpotifyNamespace> | null = null;

export function loadSpotifySdk(): Promise<SpotifyNamespace> {
  if (window.Spotify?.Player) return Promise.resolve(window.Spotify);

  sdkPromise ??= new Promise((resolve) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve(window.Spotify!);
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    document.head.appendChild(script);
  });
  return sdkPromise;
}
