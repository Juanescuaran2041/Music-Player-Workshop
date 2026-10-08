import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ListeningStatsView from "@/components/stats/ListeningStatsView";
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

  return <ListeningStatsView />;
}
