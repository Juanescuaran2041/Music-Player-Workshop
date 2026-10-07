import { useSyncExternalStore } from "react";

export class SpotifyError extends Error {}

type Tokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
];
const TOKENS_KEY = "orbitune:spotify:tokens";
const VERIFIER_KEY = "orbitune:spotify:verifier";
const STATE_KEY = "orbitune:spotify:state";

const listeners = new Set<() => void>();
const pendingLogins = new Map<string, Promise<void>>();
let pendingRefresh: Promise<string> | null = null;

function notify() {
  listeners.forEach((listener) => listener());
}

function readTokens(): Tokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveTokens(tokens: Tokens) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  notify();
}

export function disconnectSpotify() {
  localStorage.removeItem(TOKENS_KEY);
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useSpotifyConnected(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => readTokens() !== null,
    () => false,
  );
}

function base64url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomString(length: number): string {
  return base64url(crypto.getRandomValues(new Uint8Array(length))).slice(
    0,
    length,
  );
}

function redirectUri(): string {
  return `${window.location.origin}/callback`;
}

async function requestTokens(
  body: Record<string, string>,
): Promise<TokenResponse> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: CLIENT_ID ?? "", ...body }),
  });
  if (!response.ok) throw new SpotifyError("Spotify login failed. Try again.");
  return response.json();
}

// Authorization Code flow with PKCE: no client secret is needed in the browser
export async function startSpotifyLogin(): Promise<void> {
  if (!CLIENT_ID) {
    throw new SpotifyError("Missing NEXT_PUBLIC_SPOTIFY_CLIENT_ID in .env");
  }

  const verifier = randomString(96);
  const state = randomString(24);
  const challenge = base64url(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)),
    ),
  );
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES.join(" "),
    redirect_uri: redirectUri(),
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });
  window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
}

export function completeSpotifyLogin(
  code: string,
  state: string | null,
): Promise<void> {
  let pending = pendingLogins.get(code);
  if (!pending) {
    pending = (async () => {
      const verifier = sessionStorage.getItem(VERIFIER_KEY);
      if (!verifier || state !== sessionStorage.getItem(STATE_KEY)) {
        throw new SpotifyError("Spotify login expired. Try connecting again.");
      }
      const data = await requestTokens({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri(),
        code_verifier: verifier,
      });
      sessionStorage.removeItem(VERIFIER_KEY);
      sessionStorage.removeItem(STATE_KEY);
      saveTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? "",
        expiresAt: Date.now() + data.expires_in * 1000,
      });
    })();
    pendingLogins.set(code, pending);
  }
  return pending;
}

export async function getAccessToken(): Promise<string> {
  const tokens = readTokens();
  if (!tokens) throw new SpotifyError("Connect Spotify first.");
  if (Date.now() < tokens.expiresAt - 60_000) return tokens.accessToken;

  pendingRefresh ??= requestTokens({
    grant_type: "refresh_token",
    refresh_token: tokens.refreshToken,
  })
    .then((data) => {
      saveTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? tokens.refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
      });
      return data.access_token;
    })
    .catch(() => {
      disconnectSpotify();
      throw new SpotifyError("Spotify session expired. Connect again.");
    })
    .finally(() => {
      pendingRefresh = null;
    });
  return pendingRefresh;
}
