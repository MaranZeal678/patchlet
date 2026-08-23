"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/console", label: "Overview" },
  { href: "/console/knowledge", label: "Knowledge" },
  { href: "/console/repository", label: "Repository" },
  { href: "/console/activity", label: "Activity" },
] as const;

/** Console top navigation. The exact-match check keeps Overview from staying lit on child pages. */
export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="glass sticky top-4 z-10 mb-8 flex items-center gap-1 px-2 py-2">
      <Link
        href="/"
        className="mr-2 px-3 py-1.5 text-[15px] font-medium tracking-tight text-[var(--ink)]"
      >
        Patchlet
      </Link>
      <span aria-hidden className="mr-1 h-5 w-px bg-[var(--hairline)]" />
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-[8px] px-3 py-1.5 text-[14px] transition-colors ${
              active
                ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                : "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
