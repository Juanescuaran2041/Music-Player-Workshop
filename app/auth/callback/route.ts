import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// Google sign-in and the email confirmation link both land here with a
// one-time code that is traded for a session cookie.
export async function GET(request: NextRequest) {
  // request.url reports "localhost" in dev, but the session cookie belongs
  // to the host the browser actually used (e.g. 127.0.0.1)
  const origin = `${request.nextUrl.protocol}//${request.headers.get("host")}`;
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/", origin));
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
