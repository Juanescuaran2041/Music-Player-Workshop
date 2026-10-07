"use client";

import { ChangeEvent } from "react";

type Props = {
  onFiles: (files: File[]) => void;
};

export default function ImportAudio({ onFiles }: Props) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  return (
    <label className="btn-ghost cursor-pointer text-center">
      Import audio files
      <input
        type="file"
        accept="audio/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </label>
  );
}
