import FormularioLogin from "@/components/FormularioLogin";

export default function PaginaLogin() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-8 shadow-2xl shadow-black/30 ring-1 ring-white/10">
        <h1 className="mb-1 text-3xl font-bold">Music Player</h1>
        <p className="mb-8 text-muted">Inicia sesión para ver tus canciones</p>
        <FormularioLogin />
      </div>
    </main>
  );
}
