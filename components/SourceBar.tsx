"use client";

import { useState } from "react";
import { Source } from "@/lib/music";
import { disconnectSpotify, startSpotifyLogin } from "@/lib/spotify/auth";

type Props = {
  source: Source;
  connected: boolean;
  onSourceChange: (source: Source) => void;
};

const sources: { value: Source; label: string }[] = [
  { value: "youtube", label: "YouTube" },
  { value: "spotify", label: "Spotify" },
];

export default function SourceBar({ source, connected, onSourceChange }: Props) {
  const [error, setError] = useState("");

  function handleConnect() {
    startSpotifyLogin().catch((e: Error) => setError(e.message));
  }

  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
        {sources.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onSourceChange(value)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              source === value
                ? "bg-accent font-semibold text-on-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {source === "spotify" &&
        (connected ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-emerald-600">Spotify connected</span>
            <button onClick={disconnectSpotify} className="btn-ghost">
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={handleConnect} className="btn-primary">
            Connect Spotify
          </button>
        ))}

      {error && <p className="w-full text-sm text-rose-600">{error}</p>}
    </div>
  );
}
