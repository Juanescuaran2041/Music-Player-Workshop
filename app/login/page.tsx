import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-8 shadow-2xl shadow-black/30 ring-1 ring-white/10">
        <Image
          src="/brand/logo.jpg"
          alt="Spyre"
          width={608}
          height={610}
          priority
          className="mx-auto mb-4 w-48 rounded-2xl"
        />
        <h1 className="sr-only">Spyre</h1>
        <p className="mb-8 text-center text-muted">
          Sign in to see your songs
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
