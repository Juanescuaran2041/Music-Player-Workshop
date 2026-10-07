"use client";

import { Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { loadYouTubeApi, YT_STATE, YTPlayer } from "@/lib/youtubePlayer";

export type YouTubeEmbedHandle = {
  seek: (seconds: number) => void;
};

type Props = {
  ref?: Ref<YouTubeEmbedHandle>;
  videoId: string | null;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  onTime: (seconds: number) => void;
  onDuration: (seconds: number) => void;
  onEnded: () => void;
  onError: (code: number) => void;
};

export default function YouTubeEmbed({
  ref,
  videoId,
  isPlaying,
  onPlayingChange,
  onTime,
  onDuration,
  onEnded,
  onError,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const videoIdRef = useRef(videoId);
  const handlersRef = useRef({
    onPlayingChange,
    onTime,
    onDuration,
    onEnded,
    onError,
  });
  const [ready, setReady] = useState(false);

  // Keep the latest values readable from the player callbacks
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    videoIdRef.current = videoId;
    handlersRef.current = {
      onPlayingChange,
      onTime,
      onDuration,
      onEnded,
      onError,
    };
  });

  useImperativeHandle(
    ref,
    () => ({ seek: (seconds) => playerRef.current?.seekTo(seconds, true) }),
    [],
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let cancelled = false;
    let player: YTPlayer | undefined;

    // The API replaces the element it is given, so hand it a fresh one
    const host = document.createElement("div");
    wrapper.appendChild(host);

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      player = new YT.Player(host, {
        width: "100%",
        height: "100%",
        playerVars: { controls: 0, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            playerRef.current = player ?? null;
            setReady(true);
          },
          onStateChange: ({ data }) => {
            // Another source is current: a video that starts late (it was
            // still loading when the user switched) must not play over it,
            // and its events must not pause or resume the other source.
            if (!videoIdRef.current) {
              if (data === YT_STATE.PLAYING) player?.stopVideo();
              return;
            }

            const handlers = handlersRef.current;
            if (data === YT_STATE.PLAYING) handlers.onPlayingChange(true);
            else if (data === YT_STATE.PAUSED) handlers.onPlayingChange(false);
            else if (data === YT_STATE.ENDED) handlers.onEnded();
          },
          onError: ({ data }) => handlersRef.current.onError(data),
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current = null;
      player?.destroy?.();
      wrapper.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!ready || !player) return;
    if (!videoId) player.stopVideo();
    else if (isPlayingRef.current) player.loadVideoById(videoId);
    else player.cueVideoById(videoId);
  }, [ready, videoId]);

  useEffect(() => {
    const player = playerRef.current;
    // With no video selected (another source is playing) the player must stay
    // stopped: playVideo() would bring back the last video loaded.
    if (!ready || !player || !videoId) return;
    if (isPlaying) player.playVideo();
    else player.pauseVideo();
  }, [ready, videoId, isPlaying]);

  useEffect(() => {
    if (!ready || !videoId) return;
    const timer = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      handlersRef.current.onTime(player.getCurrentTime());
      const duration = player.getDuration();
      if (duration > 0) handlersRef.current.onDuration(duration);
    }, 500);
    return () => clearInterval(timer);
  }, [ready, videoId]);

  return (
    <div
      className={`aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-foreground/10 ${
        videoId ? "" : "hidden"
      }`}
    >
      <div
        ref={wrapperRef}
        className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
      />
    </div>
  );
}
