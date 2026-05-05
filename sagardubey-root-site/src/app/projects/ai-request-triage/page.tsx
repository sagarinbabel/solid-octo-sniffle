import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function AiRequestTriagePage() {
  const project = siteConfig.projects.find(
    (p) => p.id === "ai-request-triage"
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-14 md:py-20">
      <div className="flex flex-col gap-6">
        <Link
          href="/projects"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-zinc-200 hover:text-zinc-50"
        >
          <span aria-hidden="true">&lt;</span>
          Back to projects
        </Link>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
            {project?.title ?? "AI Request Triage"}
          </h1>
          <p className="mt-3 text-zinc-300">
            {project?.description ??
              "Turns messy sales/customer requests into structured work."}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-zinc-50">Placeholder</h2>
          <p className="mt-2 text-zinc-300">
            Add screenshots, architecture, and outcomes here.
          </p>
        </div>
      </div>
    </div>
  );
}
