import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-lg border border-ink-700 bg-ink-800/60 p-5",
        className,
      ].join(" ")}
    >
      {title && (
        <header className="mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-200">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-ink-400 mt-1">{subtitle}</p>
          )}
        </header>
      )}
      <div className="text-ink-100 text-sm">{children}</div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400">
        {eyebrow}
      </div>
      <h1 className="text-2xl font-semibold text-ink-50 mt-1">{title}</h1>
      {description && (
        <p className="text-ink-300 mt-2 max-w-3xl text-sm leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "warn" | "danger" | "muted";
}) {
  const map: Record<string, string> = {
    neutral: "bg-ink-700 text-ink-100 border-ink-600",
    accent: "bg-accent-600/20 text-accent-400 border-accent-500/40",
    warn: "bg-warn-500/15 text-warn-500 border-warn-500/40",
    danger: "bg-danger-500/15 text-danger-500 border-danger-500/40",
    muted: "bg-ink-800 text-ink-300 border-ink-700",
  };
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium",
        map[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
