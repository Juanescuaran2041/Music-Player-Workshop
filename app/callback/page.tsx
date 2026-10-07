"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { completeSpotifyLogin, SpotifyError } from "@/lib/spotify/auth";

export default function SpotifyCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    const login =
      code && !params.get("error")
        ? completeSpotifyLogin(code, params.get("state"))
        : Promise.reject(new SpotifyError("Spotify login was cancelled."));

    login
      .then(() => router.replace("/"))
      .catch((e: Error) => setError(e.message));
  }, [router]);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-8 text-center shadow-2xl shadow-black/30 ring-1 ring-white/10">
        {error ? (
          <>
            <p className="mb-6 text-rose-300">{error}</p>
            <button onClick={() => router.replace("/")} className="btn-primary">
              Back to Orbitune
            </button>
          </>
        ) : (
          <p className="text-muted">Connecting to Spotify...</p>
        )}
      </div>
    </main>
  );
}
