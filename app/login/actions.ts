"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error) return { error: "Incorrect email or password" };
  redirect("/");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  if (nickname.length < 2 || nickname.length > 24) {
    return { error: "Nickname must be 2 to 24 characters" };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 64) {
    return { error: "Name must be 2 to 64 characters" };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    // Stored in the user's metadata, so no database changes are needed
    options: { data: { nickname, name } },
  });

  if (error) return { error: error.message };
  if (!data.session) {
    return { message: "Check your email to confirm your account" };
  }
  redirect("/");
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
