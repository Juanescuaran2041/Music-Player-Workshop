"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/app/(main)/profile/actions";

type Props = {
  nickname: string;
  name: string;
};

export default function ProfileForm({ nickname, name }: Props) {
  const [nicknameValue, setNicknameValue] = useState(nickname);
  const [nameValue, setNameValue] = useState(name);
  const [state, action, pending] = useActionState(updateProfile, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Nickname
        <input
          name="nickname"
          value={nicknameValue}
          onChange={(e) => setNicknameValue(e.target.value)}
          placeholder="How others see you"
          minLength={2}
          maxLength={24}
          autoComplete="nickname"
          required
          className="field"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Name
        <input
          name="name"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          placeholder="Your full name"
          minLength={2}
          maxLength={64}
          autoComplete="name"
          required
          className="field"
        />
      </label>

      <div aria-live="polite" className="min-h-5 text-sm">
        {state.error && <p className="text-rose-600">{state.error}</p>}
        {state.message && <p className="text-emerald-600">{state.message}</p>}
      </div>

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
