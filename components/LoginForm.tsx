"use client";

import { useActionState, useState } from "react";
import { signIn, signUp } from "@/app/login/actions";

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [state, action, pending] = useActionState(
    isSignUp ? signUp : signIn,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      {isSignUp && (
        <input
          name="nickname"
          placeholder="Nickname"
          minLength={2}
          maxLength={24}
          autoComplete="nickname"
          required
          className="field"
        />
      )}
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="field"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        minLength={6}
        required
        className="field"
      />

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state.message && (
        <p className="text-sm text-emerald-600">{state.message}</p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
      </button>

      <button
        type="button"
        onClick={() => setIsSignUp(!isSignUp)}
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Don't have an account? Sign up"}
      </button>
    </form>
  );
}
