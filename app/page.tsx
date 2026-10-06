import { signOut } from "@/app/login/actions";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Twinbeat</h1>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:block">
            {user?.email}
          </span>
          <form action={signOut}>
            <button className="btn-ghost">Sign out</button>
          </form>
        </div>
      </header>
    </div>
  );
}
