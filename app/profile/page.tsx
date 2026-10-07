import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/Avatar";
import ProfileForm from "@/components/ProfileForm";
import { displayName, initials, readProfile } from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My profile | BloomMod",
};

function formatDate(iso: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ProfilePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = readProfile(user);
  const missing = !profile.nickname || !profile.name;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <AppHeader profile={profile} active="profile" />

      <div className="mx-auto grid w-full max-w-4xl gap-6 md:grid-cols-[18rem_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col items-center gap-3 rounded-3xl bg-surface/80 p-6 text-center ring-1 ring-foreground/10">
          <Avatar label={initials(profile)} size="lg" />
          <div className="min-w-0 max-w-full">
            <h1 className="truncate text-xl font-semibold">
              {displayName(profile)}
            </h1>
            {profile.name && (
              <p className="truncate text-sm text-muted">{profile.name}</p>
            )}
          </div>

          <dl className="mt-2 w-full space-y-3 border-t border-foreground/10 pt-4 text-left text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="truncate font-medium">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Member since</dt>
              <dd className="font-medium">{formatDate(profile.createdAt)}</dd>
            </div>
          </dl>

          <Link href="/" className="btn-ghost mt-2 w-full text-center">
            Back to the player
          </Link>
        </section>

        <section className="min-w-0 rounded-3xl bg-surface/80 p-6 ring-1 ring-foreground/10 sm:p-8">
          <h2 className="text-lg font-semibold">Edit your profile</h2>
          <p className="mb-6 mt-1 text-sm text-muted">
            {missing
              ? "Your account does not have a nickname or name yet. Add them so the app can greet you properly."
              : "These details are shown in the header of the app."}
          </p>
          <ProfileForm nickname={profile.nickname} name={profile.name} />
        </section>
      </div>
    </div>
  );
}
