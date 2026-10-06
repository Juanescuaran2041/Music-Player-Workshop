"use client";

import { useActionState, useState } from "react";
import { iniciarSesion, registrarse } from "@/app/login/actions";

export default function FormularioLogin() {
  const [modoRegistro, setModoRegistro] = useState(false);
  const [estado, accion, pendiente] = useActionState(
    modoRegistro ? registrarse : iniciarSesion,
    {},
  );

  return (
    <form action={accion} className="flex flex-col gap-4">
      <input
        name="email"
        type="email"
        placeholder="Correo electrónico"
        required
        className="campo"
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        minLength={6}
        required
        className="campo"
      />

      {estado.error && <p className="text-sm text-rose-300">{estado.error}</p>}
      {estado.mensaje && (
        <p className="text-sm text-emerald-300">{estado.mensaje}</p>
      )}

      <button type="submit" disabled={pendiente} className="boton-primario">
        {pendiente ? "Cargando..." : modoRegistro ? "Crear cuenta" : "Entrar"}
      </button>

      <button
        type="button"
        onClick={() => setModoRegistro(!modoRegistro)}
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        {modoRegistro
          ? "¿Ya tienes cuenta? Inicia sesión"
          : "¿No tienes cuenta? Regístrate"}
      </button>
    </form>
  );
}
