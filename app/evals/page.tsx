"use client";

import { Shell } from "@/components/Shell";
import { useAppState } from "@/components/AppStateProvider";
import Link from "next/link";
import type { EvalStatus } from "@/lib/evals";

function statusStyles(s: EvalStatus) {
  if (s === "pass") return "text-[var(--ok)] border-green-900/50 bg-green-950/20";
  if (s === "fail") return "text-[var(--danger)] border-red-900/50 bg-red-950/20";
  return "text-[var(--warn)] border-amber-900/50 bg-amber-950/20";
}

export default function EvalsPage() {
  const {
    lastResponse,
    runEvalsOnSamples,
    sampleEvalLoading,
    sampleEvalError,
    sampleEvalResults,
  } = useAppState();

  return (
    <Shell>
      <div className="space-y-6">
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Lightweight rule-based checks on model output. AI workflow tools need
          measurable quality gates before rollout; these checks cover structure,
          missing information, safe phrasing, routing, and approval behaviour.
        </p>
        <p className="text-xs text-[var(--warn)] border border-[var(--border)] rounded-md px-3 py-2 bg-[var(--surface-2)]">
          This is a seed eval harness, not proof of full safety.
        </p>

        {!lastResponse && !sampleEvalResults && (
          <p className="text-sm text-[var(--muted)]">
            <Link href="/" className="text-[var(--accent)] hover:underline">
              Run an analysis
            </Link>{" "}
            to see evals for your current request, or use the sample batch below.
          </p>
        )}

        {lastResponse && (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
              <h2 className="text-base font-semibold">Current output</h2>
              <div className="text-2xl font-mono font-semibold text-[var(--text)]">
                {lastResponse.evalResult.scorePercent}%
                <span className="text-sm text-[var(--muted)] font-sans ml-2">
                  score
                </span>
              </div>
            </div>
            <ul className="space-y-3">
              {lastResponse.evalResult.checks.map((c) => (
                <li
                  key={c.id}
                  className={`rounded-md border px-3 py-2 text-sm ${statusStyles(c.status)}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium uppercase text-xs tracking-wide">
                      {c.status}
                    </span>
                    <span className="text-[var(--text)]">{c.label}</span>
                  </div>
                  <p className="text-xs mt-1 opacity-90">{c.explanation}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <h2 className="text-base font-semibold">Sample batch (live API)</h2>
          <p className="text-xs text-[var(--muted)]">
            Calls <code className="text-[var(--text)]">/api/analyse</code> once
            per sample. Requires <code className="text-[var(--text)]">OPENAI_API_KEY</code>.
          </p>
          <button
            type="button"
            disabled={sampleEvalLoading}
            onClick={() => void runEvalsOnSamples()}
            className="rounded-md bg-[var(--surface-2)] border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--accent)] disabled:opacity-40"
          >
            {sampleEvalLoading ? "Running samples…" : "Run evals on all sample cases"}
          </button>
          {sampleEvalError && (
            <p className="text-sm text-red-300" role="alert">
              {sampleEvalError}
            </p>
          )}
          {sampleEvalResults && (
            <div className="space-y-6 mt-4">
              {sampleEvalResults.map((row) => (
                <div
                  key={row.label}
                  className="border border-[var(--border)] rounded-md p-4 bg-[var(--bg)]"
                >
                  <div className="flex justify-between gap-2 mb-2">
                    <h3 className="text-sm font-medium">{row.label}</h3>
                    <span className="font-mono text-sm">{row.scorePercent}%</span>
                  </div>
                  <ul className="space-y-2">
                    {row.checks.map((c) => (
                      <li key={c.id} className="text-xs flex gap-2">
                        <span
                          className={
                            c.status === "pass"
                              ? "text-[var(--ok)]"
                              : c.status === "fail"
                                ? "text-[var(--danger)]"
                                : "text-[var(--warn)]"
                          }
                        >
                          [{c.status}]
                        </span>
                        <span>{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
