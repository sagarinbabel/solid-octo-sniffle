"use client";

import Link from "next/link";
import { useState } from "react";
import { useAnalysis } from "@/components/AnalysisContext";
import { Card, PageHeader, Pill } from "@/components/Card";
import { SAMPLE_REQUESTS } from "@/lib/sampleRequests";
import type { EvalResult, EvalStatus } from "@/lib/evals";

function tone(s: EvalStatus): "accent" | "warn" | "danger" {
  if (s === "pass") return "accent";
  if (s === "warning") return "warn";
  return "danger";
}

function CheckList({ result }: { result: EvalResult }) {
  return (
    <ul className="space-y-2">
      {result.checks.map((c) => (
        <li
          key={c.id}
          className="rounded border border-ink-700 bg-ink-900/40 p-3"
        >
          <div className="flex items-center gap-2">
            <Pill tone={tone(c.status)}>{c.status.toUpperCase()}</Pill>
            <span className="text-sm font-medium text-ink-100">{c.name}</span>
          </div>
          <p className="text-xs text-ink-300 mt-1">{c.detail}</p>
        </li>
      ))}
    </ul>
  );
}

type SampleRun = {
  id: string;
  label: string;
  text: string;
  status: "pending" | "ok" | "error";
  evalResult?: EvalResult;
  error?: string;
};

export default function EvalsPage() {
  const { current } = useAnalysis();
  const [runs, setRuns] = useState<SampleRun[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function runAllSamples() {
    setBusy(true);
    const next: SampleRun[] = SAMPLE_REQUESTS.map((s) => ({
      id: s.id,
      label: s.label,
      text: s.text,
      status: "pending",
    }));
    setRuns(next);

    for (let i = 0; i < SAMPLE_REQUESTS.length; i += 1) {
      const s = SAMPLE_REQUESTS[i];
      try {
        const resp = await fetch("/api/analyse", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ requestText: s.text }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          next[i] = {
            ...next[i],
            status: "error",
            error: data?.error || `HTTP ${resp.status}`,
            evalResult: data?.evalResult,
          };
        } else {
          next[i] = {
            ...next[i],
            status: "ok",
            evalResult: data.evalResult,
          };
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "network error";
        next[i] = { ...next[i], status: "error", error: msg };
      }
      setRuns([...next]);
    }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="04 · Eval Suite"
        title="Lightweight quality gates for AI output"
        description="AI tools used in operational workflows need measurable quality gates before rollout. These checks look at structure, missing-info detection, sensitivity classification, owner routing, unsupported commitments, and risk visibility."
      />

      <Card title="Why this matters">
        <p className="text-ink-200 leading-relaxed">
          The evals here are deterministic, rule-based, and run in process — fast
          enough to gate every analysis. They do <strong>not</strong> prove full
          safety. They demonstrate the habit of measuring AI behaviour before
          shipping it into customer-facing workflows. A production system would
          add a golden eval dataset, regression tests on prompt/model changes,
          adversarial / prompt-injection probes, and sampled human grading.
        </p>
        <p className="text-xs text-ink-400 mt-3">
          This is a seed eval harness, not proof of full safety.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Current analysis evals"
          subtitle={
            current
              ? `Score ${current.evalResult.scorePct}% · ${current.evalResult.passCount} pass · ${current.evalResult.warnCount} warn · ${current.evalResult.failCount} fail`
              : "Run an analysis from the intake page first."
          }
          className="lg:col-span-2"
        >
          {!current ? (
            <p className="text-ink-300">
              No current analysis.{" "}
              <Link
                href="/"
                className="text-accent-400 hover:text-accent-500"
              >
                Submit one →
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              <ScoreBar pct={current.evalResult.scorePct} />
              <CheckList result={current.evalResult} />
            </div>
          )}
        </Card>

        <Card title="Run all samples">
          <p className="text-xs text-ink-300 mb-3">
            Sends every sample request through{" "}
            <code className="font-mono text-ink-100">/api/analyse</code> and
            shows the eval score for each. This calls the live LLM five times.
          </p>
          <button
            onClick={runAllSamples}
            disabled={busy}
            className="w-full px-3 py-2 rounded-md bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-ink-50 text-sm font-medium"
          >
            {busy ? "Running…" : "Run all sample evals"}
          </button>

          <div className="mt-4 space-y-2">
            {runs?.map((r) => (
              <div
                key={r.id}
                className="rounded border border-ink-700 bg-ink-900/40 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-100 font-medium">{r.label}</span>
                  {r.status === "pending" && <Pill tone="muted">…</Pill>}
                  {r.status === "ok" && r.evalResult && (
                    <Pill
                      tone={
                        r.evalResult.scorePct >= 80
                          ? "accent"
                          : r.evalResult.scorePct >= 60
                            ? "warn"
                            : "danger"
                      }
                    >
                      {r.evalResult.scorePct}%
                    </Pill>
                  )}
                  {r.status === "error" && <Pill tone="danger">ERROR</Pill>}
                </div>
                {r.status === "error" && (
                  <p className="text-ink-400 mt-1">{r.error}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ScoreBar({ pct }: { pct: number }) {
  const tone =
    pct >= 80 ? "bg-accent-500" : pct >= 60 ? "bg-warn-500" : "bg-danger-500";
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs uppercase tracking-[0.15em] text-ink-400">
          Eval score
        </span>
        <span className="text-2xl font-semibold text-ink-50 font-mono">
          {pct}%
        </span>
      </div>
      <div className="h-2 w-full bg-ink-700 rounded">
        <div
          className={`h-2 rounded ${tone}`}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}
