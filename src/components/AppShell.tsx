"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: { href: string; label: string; index: string }[] = [
  { href: "/", label: "Request Intake", index: "01" },
  { href: "/analysis", label: "AI Analysis", index: "02" },
  { href: "/approval", label: "Approval & Audit", index: "03" },
  { href: "/evals", label: "Eval Suite", index: "04" },
  { href: "/architecture", label: "Architecture", index: "05" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink-700 bg-ink-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-ink-400">
                Internal Prototype · Mock Data Only
              </div>
              <h1 className="text-lg font-semibold text-ink-50">
                AI Request Backbone
              </h1>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-[0.2em] text-ink-400">
                Built by Sagar Dubey
              </div>
              <div className="text-xs text-ink-300">
                Kelluu · Core AI Architect application
              </div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1">
            {TABS.map((t) => {
              const active =
                t.href === "/" ? pathname === "/" : pathname?.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={[
                    "px-3 py-1.5 rounded-md text-sm border transition-colors flex items-center gap-2",
                    active
                      ? "bg-accent-600/15 border-accent-500 text-accent-400"
                      : "bg-transparent border-ink-700 text-ink-200 hover:border-ink-500 hover:text-ink-50",
                  ].join(" ")}
                >
                  <span className="font-mono text-[10px] text-ink-400">
                    {t.index}
                  </span>
                  <span>{t.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
      <footer className="border-t border-ink-700 bg-ink-900/60">
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-ink-400 flex flex-wrap gap-x-6 gap-y-1 justify-between">
          <span>
            Prototype · No real Kelluu data · No external action taken
          </span>
          <span>Human approval required before customer-facing commitments</span>
        </div>
      </footer>
    </div>
  );
}
