"use client";

import { Shell } from "@/components/Shell";
import { useAppState } from "@/components/AppStateProvider";
import Link from "next/link";

const AUDIT_STEPS = [
  "Request received",
  "Mock context attached",
  "LLM analysis generated",
  "Schema validation completed",
  "Eval checks completed",
  "Human approval pending",
] as const;

export default function ApprovalPage() {
  const { lastResponse } = useAppState();

  if (!lastResponse) {
    return (
      <Shell>
        <p className="text-sm text-[var(--muted)]">
          No session data.{" "}
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Run an analysis first
          </Link>
          .
        </p>
      </Shell>
    );
  }

  const owners = lastResponse.result.suggested_owners;

  return (
    <Shell>
      <div className="space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <h2 className="text-base font-semibold">Approval gate</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--muted)] text-xs uppercase mb-1">
                Recommended human approval
              </p>
              <p className="text-lg font-medium">
                {lastResponse.result.recommended_human_approval ? "True" : "False"}
              </p>
            </div>
            <div>
              <p className="text-[var(--muted)] text-xs uppercase mb-1">
                Suggested approval owner(s)
              </p>
              <p>{owners.length ? owners.join(", ") : "—"}</p>
            </div>
            <div>
              <p className="text-[var(--muted)] text-xs uppercase mb-1">
                Model used
              </p>
              <p className="font-mono">{lastResponse.model}</p>
            </div>
            <div>
              <p className="text-[var(--muted)] text-xs uppercase mb-1">
                Timestamp
              </p>
              <p className="font-mono text-xs">
                {lastResponse.timestamp}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="text-sm font-semibold mb-3">System posture</h3>
          <ul className="text-sm text-[var(--muted)] space-y-2 list-disc pl-5">
            <li>
              <strong className="text-[var(--text)]">No external action taken</strong>{" "}
              — no emails, tickets, or customer messages sent.
            </li>
            <li>Mock data only — no Kelluu confidential payloads.</li>
            <li>
              Human approval required before customer-facing commitments.
            </li>
            <li>Secrets and production systems are not accessible.</li>
            <li>
              This prototype does not connect to CRM, ERP, ticketing, repos, or
              internal docs.
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="text-sm font-semibold mb-3">Audit trail</h3>
          <ol className="space-y-2">
            {AUDIT_STEPS.map((step, i) => (
              <li
                key={step}
                className="flex gap-3 text-sm border-l-2 border-[var(--accent)] pl-3 py-1"
              >
                <span className="text-[var(--muted)] font-mono text-xs w-6">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Shell>
  );
}
