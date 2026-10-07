import AppBackground from "@/components/AppBackground";
import AppHeader from "@/components/AppHeader";
import Player from "@/components/Player";
import { displayName, readProfile } from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Accounts created before nicknames existed fall back to their email
  const profile = readProfile(user);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <AppBackground />
      <AppHeader profile={profile} active="player" />

      <section className="card-rise">
        <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back, <span className="text-brand">{displayName(profile)}</span>
        </h1>
        <p className="mt-1 text-muted">
          Search a song, drop in your own files or pick something made for you.
        </p>
      </section>

      <Player />
    </div>
  );
}
