"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { href: "/", label: "Player" },
  { href: "/playlists", label: "Playlists" },
  { href: "/stats", label: "Stats" },
  { href: "/profile", label: "My profile" },
];

const navLink =
  "rounded-full px-4 py-1.5 text-sm transition-colors hover:text-foreground";

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 rounded-full bg-foreground/5 p-1">
      {sections.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${navLink} ${
              active
                ? "bg-accent font-semibold text-on-accent hover:text-on-accent"
                : "text-muted"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
