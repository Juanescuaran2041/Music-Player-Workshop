import Image from "next/image";
import { signOut } from "@/app/login/actions";
import Player from "@/components/Player";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/mark.jpg"
            alt=""
            width={525}
            height={440}
            className="h-12 w-14 rounded-xl object-cover"
          />
          <h1 className="text-brand text-2xl font-bold tracking-tight">Spyre</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:block">
            {user?.email}
          </span>
          <form action={signOut}>
            <button className="btn-ghost">Sign out</button>
          </form>
        </div>
      </header>
      <Player />
    </div>
  );
}
