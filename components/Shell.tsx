import { TabNav } from "@/components/TabNav";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
                Prototype
              </p>
              <h1 className="text-lg font-semibold text-[var(--text)]">
                AI Request Backbone
              </h1>
            </div>
            <p className="text-xs text-[var(--muted)] max-w-md text-right">
              Kelluu-aligned internal triage demo — mocked data only
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <TabNav />
        {children}
      </main>
      <footer className="border-t border-[var(--border)] mt-16 py-6 text-center text-xs text-[var(--muted)]">
        Built for Sagar Dubey&apos;s Kelluu Core AI Architect application. Not a
        production Kelluu product.
      </footer>
    </div>
  );
}
