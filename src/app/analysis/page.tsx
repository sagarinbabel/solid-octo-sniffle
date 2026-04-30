"use client";

import Link from "next/link";
import { useAnalysis } from "@/components/AnalysisContext";
import { Card, PageHeader, Pill } from "@/components/Card";

function sensitivityTone(s: string): "accent" | "warn" | "danger" | "muted" {
  const v = s.toLowerCase();
  if (v.includes("defence") || v.includes("high")) return "danger";
  if (v.includes("medium")) return "warn";
  if (v.includes("low")) return "muted";
  return "accent";
}

export default function AnalysisPage() {
  const { current } = useAnalysis();

  if (!current) {
    return (
      <div>
        <PageHeader
          eyebrow="02 · AI Analysis"
          title="No analysis yet"
          description="Submit a request from the intake page, and the structured AI analysis will appear here."
        />
        <Link
          href="/"
          className="text-accent-400 hover:text-accent-500 text-sm"
        >
          ← Go to Request Intake
        </Link>
      </div>
    );
  }

  const r = current.result;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="02 · AI Analysis"
        title="Structured AI Output"
        description="The model output below is parsed JSON, validated against a strict Zod schema, and then run through a rule-based eval suite."
      />

      <div className="flex flex-wrap gap-2">
        <Pill tone="accent">model: {current.model}</Pill>
        <Pill tone="muted">timestamp: {current.timestamp}</Pill>
        <Pill tone={sensitivityTone(r.sensitivity)}>
          sensitivity: {r.sensitivity}
        </Pill>
        <Pill tone={r.recommended_human_approval ? "warn" : "muted"}>
          human approval:{" "}
          {r.recommended_human_approval ? "REQUIRED" : "not required"}
        </Pill>
        <Pill tone="accent">
          confidence: {Math.round((r.confidence ?? 0) * 100)}%
        </Pill>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Original Request">
          <pre className="whitespace-pre-wrap font-mono text-xs text-ink-200 bg-ink-900 rounded p-3 border border-ink-700">
            {current.requestText}
          </pre>
        </Card>
        <Card title="Summary">
          <p className="text-ink-100 leading-relaxed">{r.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill tone="accent">classification: {r.classification}</Pill>
          </div>
        </Card>

        <Card title="Extracted fields">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {Object.entries(r.extracted_fields).map(([k, v]) => (
              <div
                key={k}
                className="rounded border border-ink-700 bg-ink-900/60 px-3 py-2"
              >
                <dt className="text-[10px] uppercase tracking-[0.15em] text-ink-400">
                  {k.replace(/_/g, " ")}
                </dt>
                <dd className="text-ink-100">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card
          title="Missing information"
          subtitle="What we need before commitments."
        >
          {r.missing_information.length === 0 ? (
            <p className="text-ink-300">No missing information identified.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {r.missing_information.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Suggested owners">
          <div className="flex flex-wrap gap-2">
            {r.suggested_owners.map((o, i) => (
              <Pill key={i} tone="accent">
                {o}
              </Pill>
            ))}
          </div>
        </Card>

        <Card title="Internal tasks">
          {r.internal_tasks.length === 0 ? (
            <p className="text-ink-300">No internal tasks suggested.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {r.internal_tasks.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Draft internal spec" subtitle="For Software/Ops/Product.">
          <pre className="whitespace-pre-wrap text-sm text-ink-100 bg-ink-900 rounded p-3 border border-ink-700">
            {r.draft_internal_spec}
          </pre>
        </Card>

        <Card
          title="Draft customer response"
          subtitle="Cautious. No commitments. Requires human approval."
        >
          <pre className="whitespace-pre-wrap text-sm text-ink-100 bg-ink-900 rounded p-3 border border-warn-500/40">
            {r.draft_customer_response}
          </pre>
          <p className="text-xs text-warn-500 mt-2">
            ⚠ This draft is not sent. Customer-facing commitments require human
            approval (see Approval & Audit).
          </p>
        </Card>

        <Card title="Risk notes">
          {r.risk_notes.length === 0 ? (
            <p className="text-ink-300">No risk notes recorded.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {r.risk_notes.map((rn, i) => (
                <li key={i}>{rn}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/approval"
          className="px-4 py-2 rounded-md bg-accent-600 hover:bg-accent-500 text-ink-50 text-sm font-medium"
        >
          → Review approval & audit
        </Link>
        <Link
          href="/evals"
          className="px-4 py-2 rounded-md border border-ink-700 hover:border-ink-500 text-ink-100 text-sm"
        >
          → View eval results
        </Link>
      </div>
    </div>
  );
}
