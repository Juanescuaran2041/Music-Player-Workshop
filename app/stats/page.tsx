import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppBackground from "@/components/AppBackground";
import AppHeader from "@/components/AppHeader";
import ListeningStatsView from "@/components/stats/ListeningStatsView";
import { readProfile } from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My stats | BloomMod",
};

export default async function StatsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <AppBackground />
      <AppHeader profile={readProfile(user)} active="stats" />
      <ListeningStatsView />
    </div>
  );
}
