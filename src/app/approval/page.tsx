"use client";

import Link from "next/link";
import { useState } from "react";
import { useAnalysis } from "@/components/AnalysisContext";
import { Card, PageHeader, Pill } from "@/components/Card";

const HARD_GUARANTEES = [
  "No external action taken.",
  "Mock data only.",
  "Human approval required before customer-facing commitments.",
  "Secrets and production systems are not accessible.",
  "This prototype does not connect to CRM, ERP, ticketing, repos, or internal docs.",
];

export default function ApprovalPage() {
  const { current } = useAnalysis();
  const [approved, setApproved] = useState<null | "approved" | "rejected">(
    null,
  );

  if (!current) {
    return (
      <div>
        <PageHeader
          eyebrow="03 · Approval & Audit"
          title="No analysis to approve yet"
          description="Run an analysis first."
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
  const auditTrail = [
    { step: "Request received", detail: "User submitted free-text request." },
    {
      step: "Mock context attached",
      detail:
        "Server prompt builder injected MOCKED policy/intake snippets (see Architecture).",
    },
    {
      step: "LLM analysis generated",
      detail: `Server-side call to ${current.model}. API key never exposed to browser.`,
    },
    {
      step: "Schema validation completed",
      detail: "Output parsed and validated with Zod (AnalysisSchema).",
    },
    {
      step: "Eval checks completed",
      detail: `Local rule-based eval suite ran. Score: ${current.evalResult.scorePct}%.`,
    },
    {
      step: "Human approval pending",
      detail:
        approved === "approved"
          ? "Reviewer marked APPROVED in this prototype (no external action triggered)."
          : approved === "rejected"
            ? "Reviewer marked REJECTED in this prototype (no external action triggered)."
            : "Awaiting reviewer decision in this prototype (no external action triggered).",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="03 · Approval & Audit"
        title="Human-in-the-loop review"
        description="In production this gate would be enforced by SSO/RBAC + an audit DB. Here it is shown as a deliberate, visible step."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Approval status" className="lg:col-span-1">
          <div className="space-y-3">
            <div>
              <div className="text-xs uppercase tracking-[0.15em] text-ink-400">
                Recommended human approval
              </div>
              <div className="mt-1">
                <Pill tone={r.recommended_human_approval ? "warn" : "muted"}>
                  {r.recommended_human_approval ? "REQUIRED" : "not required"}
                </Pill>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.15em] text-ink-400">
                Suggested approval owners
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {r.suggested_owners.map((o, i) => (
                  <Pill key={i} tone="accent">
                    {o}
                  </Pill>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setApproved("approved")}
                className={[
                  "px-3 py-1.5 rounded-md text-sm border",
                  approved === "approved"
                    ? "border-accent-500 bg-accent-600/20 text-accent-400"
                    : "border-ink-700 text-ink-100 hover:border-accent-500",
                ].join(" ")}
              >
                Mark approved (mock)
              </button>
              <button
                onClick={() => setApproved("rejected")}
                className={[
                  "px-3 py-1.5 rounded-md text-sm border",
                  approved === "rejected"
                    ? "border-danger-500 bg-danger-500/15 text-danger-500"
                    : "border-ink-700 text-ink-100 hover:border-danger-500",
                ].join(" ")}
              >
                Mark rejected (mock)
              </button>
            </div>
            <p className="text-xs text-ink-400">
              No external system is contacted. This is a UI-only demonstration of
              the approval gate.
            </p>
          </div>
        </Card>

        <Card title="Audit trail" className="lg:col-span-2">
          <ol className="space-y-3">
            {auditTrail.map((a, i) => (
              <li
                key={i}
                className="flex gap-3 items-start border-l-2 border-ink-700 pl-3"
              >
                <div className="text-[10px] font-mono text-ink-400 mt-0.5 w-6">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="text-sm text-ink-100 font-medium">
                    {a.step}
                  </div>
                  <div className="text-xs text-ink-300">{a.detail}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Run metadata">
          <dl className="grid grid-cols-1 gap-2 text-sm">
            <div className="rounded border border-ink-700 bg-ink-900/60 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-[0.15em] text-ink-400">
                model
              </dt>
              <dd className="text-ink-100 font-mono">{current.model}</dd>
            </div>
            <div className="rounded border border-ink-700 bg-ink-900/60 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-[0.15em] text-ink-400">
                timestamp
              </dt>
              <dd className="text-ink-100 font-mono">{current.timestamp}</dd>
            </div>
            <div className="rounded border border-ink-700 bg-ink-900/60 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-[0.15em] text-ink-400">
                eval score
              </dt>
              <dd className="text-ink-100 font-mono">
                {current.evalResult.scorePct}%
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Hard guarantees" className="lg:col-span-2">
          <ul className="list-disc pl-5 space-y-1.5 text-ink-200">
            {HARD_GUARANTEES.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </Card>

        <Card title="Audit notes from model" className="lg:col-span-3">
          {r.audit_notes.length === 0 ? (
            <p className="text-ink-300">No audit notes from model.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {r.audit_notes.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
