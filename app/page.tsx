import { signOut } from "@/app/login/actions";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold">Music Player</h1>
      <p className="text-muted">{user?.email}</p>
      <form action={signOut}>
        <button className="btn-primary">Sign out</button>
      </form>
    </main>
  );
}
