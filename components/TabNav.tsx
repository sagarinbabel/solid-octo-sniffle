"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Request Intake" },
  { href: "/analysis", label: "AI Analysis" },
  { href: "/approval", label: "Approval & Audit" },
  { href: "/evals", label: "Eval Suite" },
  { href: "/architecture", label: "Architecture" },
] as const;

export function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 border-b border-[var(--border)] pb-3 mb-8">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              active
                ? "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
