import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-sm font-medium text-zinc-200">
              Building products with AI
            </span>
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
            {siteConfig.tagline}
          </h1>

          <p className="max-w-prose text-pretty text-zinc-300">
            I help teams turn messy requirements into crisp, shippable systems.
            From product strategy to practical engineering.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/projects"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-white/90"
            >
              View projects
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-emerald-400/20 via-sky-400/20 to-purple-400/20 blur" />
          <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-2 shadow-2xl shadow-black/40">
            <div className="overflow-hidden rounded-[1.75rem] bg-zinc-950">
              <img
                src="/profile-placeholder.svg"
                alt="Profile placeholder"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 border-t border-white/10 pt-10">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-200">
          Social
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {siteConfig.social.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-zinc-50"
            >
              {s.label}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-zinc-50">Quick note</h2>
          <p className="mt-2 text-zinc-300">
            This is a clean landing-page template with a triage-style dark
            aesthetic. Swap the placeholder links and the profile SVG to
            personalize it.
          </p>
        </div>
      </section>
    </div>
  );
}
