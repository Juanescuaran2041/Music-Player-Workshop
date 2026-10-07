"use client";

import { Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { playOnDevice } from "@/lib/spotify/api";
import { getAccessToken } from "@/lib/spotify/auth";
import { loadSpotifySdk, SpotifyPlayer as SdkPlayer } from "@/lib/spotify/sdk";

export type SpotifyPlayerHandle = {
  seek: (seconds: number) => void;
};

type Props = {
  ref?: Ref<SpotifyPlayerHandle>;
  connected: boolean;
  uri: string | null;
  isPlaying: boolean;
  onTime: (seconds: number) => void;
  onDuration: (seconds: number) => void;
  onEnded: () => void;
  onError: (message: string) => void;
};

// Headless: the Web Playback SDK turns this browser tab into a Spotify device
export default function SpotifyPlayer({
  ref,
  connected,
  uri,
  isPlaying,
  onTime,
  onDuration,
  onEnded,
  onError,
}: Props) {
  const playerRef = useRef<SdkPlayer | null>(null);
  const deviceIdRef = useRef("");
  const loadedUriRef = useRef<string | null>(null);
  const wasPlayingRef = useRef(false);
  // What the app wants right now, so late responses can be corrected
  const desiredRef = useRef<{ uri: string | null; isPlaying: boolean }>({
    uri: null,
    isPlaying: false,
  });
  const handlersRef = useRef({ onTime, onDuration, onEnded, onError });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    handlersRef.current = { onTime, onDuration, onEnded, onError };
  });

  useImperativeHandle(
    ref,
    () => ({
      seek: (seconds) => {
        playerRef.current?.seek(seconds * 1000).catch(() => {});
      },
    }),
    [],
  );

  useEffect(() => {
    if (!connected) return;
    let cancelled = false;
    let player: SdkPlayer | undefined;

    loadSpotifySdk().then((Spotify) => {
      if (cancelled) return;
      player = new Spotify.Player({
        name: "BloomMod",
        volume: 0.8,
        getOAuthToken: (callback) => {
          getAccessToken()
            .then(callback)
            .catch((error: Error) => handlersRef.current.onError(error.message));
        },
      });

      player.addListener("ready", ({ device_id }) => {
        deviceIdRef.current = device_id;
        playerRef.current = player ?? null;
        setReady(true);
      });
      player.addListener("not_ready", () => setReady(false));

      player.addListener("account_error", () =>
        handlersRef.current.onError(
          "Spotify Premium is required to play full songs.",
        ),
      );
      player.addListener("authentication_error", ({ message }) =>
        handlersRef.current.onError(message),
      );
      player.addListener("initialization_error", ({ message }) =>
        handlersRef.current.onError(message),
      );
      player.addListener("playback_error", ({ message }) => {
        // Pausing an empty player is harmless, so it should not surface
        if (!/no list was loaded/i.test(message)) {
          handlersRef.current.onError(message);
        }
      });

      // The SDK has no "ended" event: a finished track shows up as paused
      // at position 0 with the track listed among the previous ones.
      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        const wasPlaying = wasPlayingRef.current;
        wasPlayingRef.current = !state.paused;

        const finished =
          state.paused &&
          state.position === 0 &&
          wasPlaying &&
          state.track_window.previous_tracks.some(
            (track) => track.uri === loadedUriRef.current,
          );
        if (finished) {
          loadedUriRef.current = null;
          handlersRef.current.onEnded();
        }
      });

      player.connect();
    });

    return () => {
      cancelled = true;
      playerRef.current = null;
      deviceIdRef.current = "";
      loadedUriRef.current = null;
      setReady(false);
      player?.disconnect();
    };
  }, [connected]);

  useEffect(() => {
    const player = playerRef.current;
    desiredRef.current = { uri, isPlaying };
    if (!ready || !player || !deviceIdRef.current) return;

    if (!uri || !isPlaying) {
      // Nothing to pause until a track has been loaded on this device
      if (loadedUriRef.current) player.pause().catch(() => {});
      if (!uri) loadedUriRef.current = null;
      return;
    }
    if (loadedUriRef.current === uri) {
      player.resume().catch(() => {});
      return;
    }

    loadedUriRef.current = uri;
    playOnDevice(deviceIdRef.current, uri)
      .then(() => {
        // The request can land after the user paused or switched to another
        // source. Spotify would then start the track on its own, so stop it.
        const wanted = desiredRef.current;
        if (!wanted.uri || !wanted.isPlaying) {
          playerRef.current?.pause().catch(() => {});
        }
      })
      .catch((error: Error) => {
        loadedUriRef.current = null;
        handlersRef.current.onError(error.message);
      });
  }, [ready, uri, isPlaying]);

  useEffect(() => {
    if (!ready || !uri) return;
    const timer = setInterval(async () => {
      const state = await playerRef.current?.getCurrentState();
      if (!state || state.track_window.current_track.uri !== uri) return;
      handlersRef.current.onTime(state.position / 1000);
      if (state.duration > 0) {
        handlersRef.current.onDuration(state.duration / 1000);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [ready, uri]);

  return null;
}
