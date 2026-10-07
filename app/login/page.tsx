import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-8 shadow-2xl shadow-slate-900/10 ring-1 ring-foreground/10">
        <Image
          src="/brand/mark.jpg"
          alt=""
          width={525}
          height={440}
          priority
          className="mx-auto mb-4 w-32 rounded-2xl"
        />
        <h1 className="text-brand mb-2 text-center text-4xl font-bold tracking-tight">
          Orbitune
        </h1>
        <p className="mb-8 text-center text-muted">
          Sign in to see your songs
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
