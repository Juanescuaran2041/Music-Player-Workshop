"use server";

import { revalidatePath } from "next/cache";
import { checkProfile } from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";

export type ProfileState = { error?: string; message?: string };

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  const problem = checkProfile(nickname, name);
  if (problem) return { error: problem };

  const supabase = await createServerSupabase();
  // Stored in the user's metadata, so no database changes are needed
  const { error } = await supabase.auth.updateUser({
    data: { nickname, name },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { message: "Profile updated" };
}
