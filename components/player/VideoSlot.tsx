"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "./PlayerProvider";

export default function VideoSlot() {
  const { current, registerVideoSlot, releaseVideoSlot } = usePlayer();
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    registerVideoSlot(slot);
    return () => releaseVideoSlot(slot);
  }, [registerVideoSlot, releaseVideoSlot]);

  return (
    <div
      ref={slotRef}
      aria-hidden="true"
      className={`aspect-video w-full ${current?.videoId ? "" : "hidden"}`}
    />
  );
}
