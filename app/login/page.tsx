import Image from "next/image";
import AppBackground from "@/components/AppBackground";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="relative isolate flex flex-1 items-center justify-center p-6">
      <AppBackground />

      <div className="login-card card-rise relative w-full max-w-sm overflow-hidden rounded-3xl bg-surface/75 px-8 pb-8 pt-10 shadow-2xl shadow-slate-900/10 ring-1 ring-white/60 backdrop-blur-xl">
        {/* Thin brand stripe along the top edge */}
        <div className="bg-brand absolute inset-x-0 top-0 h-1" />

        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/mark.jpg"
            alt=""
            width={512}
            height={512}
            priority
            className="mb-4 size-20 rounded-2xl object-cover shadow-lg shadow-fuchsia-500/20 ring-4 ring-white/80"
          />
          <h1 className="text-brand text-3xl font-bold tracking-tight">
            BloomMod
          </h1>
          <p className="mt-1 text-sm text-muted">Sign in to see your songs</p>
        </div>

        <LoginForm
          callbackError={
            error
              ? "That link expired or sign-in failed. Try again."
              : undefined
          }
        />
      </div>
    </main>
  );
}
