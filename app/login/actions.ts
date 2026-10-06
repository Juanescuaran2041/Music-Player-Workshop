"use server";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";

export type EstadoAuth = { error?: string; mensaje?: string };

export async function iniciarSesion(
  _previo: EstadoAuth,
  datos: FormData,
): Promise<EstadoAuth> {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(datos.get("email")),
    password: String(datos.get("password")),
  });

  if (error) return { error: "Correo o contraseña incorrectos" };
  redirect("/");
}

export async function registrarse(
  _previo: EstadoAuth,
  datos: FormData,
): Promise<EstadoAuth> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email: String(datos.get("email")),
    password: String(datos.get("password")),
  });

  if (error) return { error: error.message };
  if (!data.session) {
    return { mensaje: "Revisa tu correo para confirmar la cuenta" };
  }
  redirect("/");
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
