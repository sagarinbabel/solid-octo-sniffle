"use client";

import { Shell } from "@/components/Shell";
import { useAppState } from "@/components/AppStateProvider";
import { SAMPLE_REQUESTS } from "@/lib/sample-requests";

export default function IntakePage() {
  const {
    requestText,
    setRequestText,
    analyse,
    loading,
    error,
    setTab,
    lastResponse,
  } = useAppState();

  return (
    <Shell>
      <div className="space-y-8">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--text)] mb-2">
            Request Intake
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
            This prototype supports{" "}
            <strong className="text-[var(--text)]">Sagar Dubey</strong>
            &apos;s application for the{" "}
            <strong className="text-[var(--text)]">
              Core AI Architect
            </strong>{" "}
            role at <strong className="text-[var(--text)]">Kelluu</strong>{" "}
            (persistent aerial intelligence and autonomy for defence,
            infrastructure, and environmental workflows). It shows how messy
            sales, customer, and ops requests can be turned into structured,
            reviewable work before engineering and operations are interrupted.
          </p>
          <p className="text-xs text-[var(--warn)] border border-[var(--border)] rounded-md px-3 py-2 bg-[var(--surface-2)]">
            Mocked data only. No Kelluu confidential data used. No connection to
            CRM, ticketing, or internal systems.
          </p>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <label
            htmlFor="request"
            className="block text-sm font-medium text-[var(--text)] mb-2"
          >
            Messy request
          </label>
          <textarea
            id="request"
            rows={8}
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            placeholder="Paste an unstructured email thread, chat log, or brief…"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono"
          />

          <div className="mt-4">
            <p className="text-xs text-[var(--muted)] mb-2">Sample requests</p>
            <div className="flex flex-col gap-2">
              {SAMPLE_REQUESTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setRequestText(s.text)}
                  className="text-left text-sm px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent-dim)] transition-colors"
                >
                  <span className="text-[var(--text)] font-medium">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={loading || !requestText.trim()}
              onClick={() => void analyse()}
              className="inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-dim)] disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? "Analysing…" : "Analyse with AI"}
            </button>
            {lastResponse && (
              <button
                type="button"
                onClick={() => setTab("analysis")}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                View last analysis →
              </button>
            )}
          </div>

          {loading && (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Server-side analysis in progress (LLM + validation + evals)…
            </p>
          )}
          {error && (
            <div
              className="mt-4 rounded-md border border-[var(--danger)]/50 bg-red-950/30 px-3 py-2 text-sm text-red-200"
              role="alert"
            >
              {error}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
