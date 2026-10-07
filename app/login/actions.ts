"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword } from "@/lib/password";
import { checkProfile } from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

// Where Google and the confirmation email send the user back
async function callbackUrl(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get("origin") ?? `http://${headerList.get("host")}`;
  return `${origin}/auth/callback`;
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error?.code === "email_not_confirmed") {
    return { error: "Confirm your email first. Check your inbox." };
  }
  if (error) return { error: "Incorrect email or password" };
  redirect("/");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const problem = checkProfile(nickname, name) ?? checkPassword(password);
  if (problem) return { error: problem };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password,
    options: {
      // Stored in the user's metadata, so no database changes are needed
      data: { nickname, name },
      emailRedirectTo: await callbackUrl(),
    },
  });

  if (error) return { error: error.message };
  if (!data.session) {
    return { message: "Check your email to confirm your account" };
  }
  redirect("/");
}

export async function signInWithGoogle(): Promise<AuthState> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: await callbackUrl() },
  });

  if (error || !data.url) return { error: "Google sign-in is not available" };
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
