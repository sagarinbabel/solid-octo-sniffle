import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
            Projects
          </h1>
          <p className="mt-2 max-w-prose text-zinc-300">
            A few things I've built to help teams ship.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {siteConfig.projects.map((project) => (
          <Link
            key={project.id}
            href={project.href}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm transition hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-50">
                  {project.title}
                </h2>
                <p className="mt-2 text-zinc-300">{project.description}</p>
              </div>
              <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-950/50 text-sm font-semibold text-zinc-200 transition group-hover:border-white/20">
                &gt;
              </span>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-200">
              View project
              <span className="transition group-hover:translate-x-0.5">
                -{'>'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
