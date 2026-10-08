import type { Metadata } from "next";
import PlaylistsView from "@/components/PlaylistsView";

export const metadata: Metadata = {
  title: "My playlists | BloomMod",
};

export default function PlaylistsPage() {
  return <PlaylistsView />;
}
