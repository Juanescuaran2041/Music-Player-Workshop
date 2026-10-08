import { ReactNode } from "react";
import AppBackground from "@/components/AppBackground";
import AppHeader from "@/components/AppHeader";
import MiniPlayer from "@/components/player/MiniPlayer";
import PlayerProvider from "@/components/player/PlayerProvider";
import { readProfile } from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PlayerProvider>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">
        <AppBackground />
        <AppHeader profile={readProfile(user)} />
        {children}
        <MiniPlayer />
      </div>
    </PlayerProvider>
  );
}
