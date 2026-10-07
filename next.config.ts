import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Spotify only accepts loopback IPs as redirect URIs, so the app is opened
  // at http://127.0.0.1:3000. Without this, Next blocks the dev resources it
  // needs for that origin and the page never becomes interactive.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
