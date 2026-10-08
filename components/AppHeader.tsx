import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { displayName, initials, Profile } from "@/lib/profile";
import Avatar from "./Avatar";

type Section = "player" | "stats" | "profile";

type Props = {
  profile: Profile;
  active: Section;
};

const sections: { id: Section; href: string; label: string }[] = [
  { id: "player", href: "/", label: "Player" },
  { id: "stats", href: "/stats", label: "Stats" },
  { id: "profile", href: "/profile", label: "My profile" },
];

const navLink =
  "rounded-full px-4 py-1.5 text-sm transition-colors hover:text-foreground";

export default function AppHeader({ profile, active }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-surface/70 px-4 py-3 shadow-sm shadow-slate-900/5 ring-1 ring-foreground/10 backdrop-blur">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/brand/mark.jpg"
          alt=""
          width={512}
          height={512}
          priority
          className="h-11 w-11 rounded-xl object-cover"
        />
        <span className="text-brand text-2xl font-bold tracking-tight">
          BloomMod
        </span>
      </Link>

      <nav className="flex items-center gap-1 rounded-full bg-foreground/5 p-1">
        {sections.map(({ id, href, label }) => (
          <Link
            key={id}
            href={href}
            aria-current={active === id ? "page" : undefined}
            className={`${navLink} ${
              active === id
                ? "bg-accent font-semibold text-on-accent hover:text-on-accent"
                : "text-muted"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          title={profile.email}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-foreground/5"
        >
          <Avatar label={initials(profile)} />
          <span className="hidden max-w-40 truncate text-sm font-medium sm:block">
            {displayName(profile)}
          </span>
        </Link>
        <form action={signOut}>
          <button className="btn-ghost">Sign out</button>
        </form>
      </div>
    </header>
  );
}
