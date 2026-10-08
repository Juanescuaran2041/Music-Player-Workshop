"use client";

import { useSyncExternalStore } from "react";
import { Theme, ThemePreference } from "@/lib/ThemePreference";

const preference = new ThemePreference();

function subscribe(onChange: () => void) {
  return preference.subscribe(onChange);
}

function getTheme(): Theme | null {
  return preference.current();
}

function getServerTheme(): Theme | null {
  return null;
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const dark = theme === "dark";
  const label = dark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => preference.toggle()}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted ring-1 ring-foreground/15 transition hover:bg-foreground/10 hover:text-foreground active:scale-90"
    >
      {theme === null ? null : dark ? (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
