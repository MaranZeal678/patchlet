"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/console/AccountMenu";
import { NotificationBell } from "@/components/console/NotificationBell";
import { Mark } from "@/components/landing/Mark";

const LINKS = [
  { href: "/console", label: "Overview" },
  { href: "/console/knowledge", label: "Knowledge" },
  { href: "/console/conversations", label: "Conversations" },
  { href: "/console/repository", label: "Repository" },
  { href: "/console/activity", label: "Activity" },
] as const;

type Props = {
  email: string;
  company: string | null;
  githubLogin: string | null;
};

/** The console's top bar. The exact match keeps Overview from staying lit on child pages. */
export function ConsoleNav({ email, company, githubLogin }: Props) {
  const pathname = usePathname();

  return (
    <header className="app-bar">
      <Link href="/" className="app-bar__brand">
        <Mark className="h-[30px] w-[30px]" />
        <span className="app-bar__wordmark">Patchlet</span>
      </Link>
      <nav className="app-nav" aria-label="Console">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`app-nav__tab${active ? " is-active" : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="app-bar__end">
        <NotificationBell />
        <AccountMenu email={email} company={company} githubLogin={githubLogin} />
      </div>
    </header>
  );
}
