import type { User } from "@supabase/supabase-js";

export type Profile = {
  nickname: string;
  name: string;
  email: string;
  createdAt: string;
};

// Returns the first problem found, or null when both values are valid
export function checkProfile(nickname: string, name: string): string | null {
  if (nickname.length < 2 || nickname.length > 24) {
    return "Nickname must be 2 to 24 characters";
  }
  if (name.length < 2 || name.length > 64) {
    return "Name must be 2 to 64 characters";
  }
  return null;
}

// Accounts created before nicknames existed have no metadata, so every
// value falls back to an empty string.
export function readProfile(user: User | null): Profile {
  const metadata = user?.user_metadata;
  return {
    nickname: typeof metadata?.nickname === "string" ? metadata.nickname : "",
    name: typeof metadata?.name === "string" ? metadata.name : "",
    email: user?.email ?? "",
    createdAt: user?.created_at ?? "",
  };
}

export function displayName(profile: Profile): string {
  return profile.nickname || profile.name || profile.email.split("@")[0];
}

export function initials(profile: Profile): string {
  const source = profile.name || profile.nickname || profile.email.split("@")[0];
  const words = source.split(/[\s._-]+/).filter(Boolean);
  const letters =
    words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}
