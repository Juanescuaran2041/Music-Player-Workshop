import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden p-6">
      <Image
        src="/brand/bloommod-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-slate-950/50" />

      <div className="w-full max-w-sm rounded-3xl bg-surface/95 p-8 shadow-2xl shadow-black/30 ring-1 ring-foreground/10 backdrop-blur">
        <Image
          src="/brand/bloommod-logo.jpg"
          alt="BloomMod"
          width={1408}
          height={768}
          priority
          className="mx-auto mb-5 w-full rounded-2xl"
        />
        <h1 className="sr-only">BloomMod</h1>
        <p className="mb-8 text-center text-muted">
          Sign in to see your songs
        </p>
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
