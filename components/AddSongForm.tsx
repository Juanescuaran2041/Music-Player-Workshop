"use client";

import { FormEvent, useState } from "react";
import { Song } from "@/lib/Song";

export type Placement = "start" | "end" | "position";

type Props = {
  size: number;
  onAdd: (song: Song, placement: Placement, position: number) => void;
};

const placements: { value: Placement; label: string }[] = [
  { value: "start", label: "Start" },
  { value: "end", label: "End" },
  { value: "position", label: "Position" },
];

export default function AddSongForm({ size, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [duration, setDuration] = useState("");
  const [placement, setPlacement] = useState<Placement>("end");
  const [position, setPosition] = useState("1");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const song = new Song(
      crypto.randomUUID(),
      title.trim(),
      artist.trim() || "Unknown artist",
      Number(duration) || 0,
      "",
    );

    try {
      onAdd(song, placement, Number(position));
      setTitle("");
      setArtist("");
      setDuration("");
      setError("");
    } catch {
      setError(`Position must be between 1 and ${size + 1}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card flex flex-col gap-3 p-6"
    >
      <h2 className="text-lg font-semibold">Add a song</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
        className="field"
      />
      <input
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artist"
        className="field"
      />
      <input
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        type="number"
        min={0}
        placeholder="Duration (seconds)"
        className="field"
      />

      <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
        {placements.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setPlacement(value)}
            className={`flex-1 rounded-full py-2 text-sm transition-colors ${
              placement === value
                ? "bg-accent font-semibold text-on-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {placement === "position" && (
        <input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          type="number"
          min={1}
          max={size + 1}
          placeholder={`Position (1 to ${size + 1})`}
          required
          className="field"
        />
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button type="submit" className="btn-primary">
        Add song
      </button>
    </form>
  );
}
