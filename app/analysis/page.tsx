"use client";

import { Shell } from "@/components/Shell";
import { useAppState } from "@/components/AppStateProvider";
import Link from "next/link";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
        {title}
      </h3>
      <div className="text-sm text-[var(--text)] leading-relaxed">{children}</div>
    </div>
  );
}

export default function AnalysisPage() {
  const { lastResponse } = useAppState();

  if (!lastResponse) {
    return (
      <Shell>
        <p className="text-sm text-[var(--muted)]">
          No analysis yet.{" "}
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Go to Request Intake
          </Link>{" "}
          and run &quot;Analyse with AI&quot;.
        </p>
      </Shell>
    );
  }

  const r = lastResponse.result;

  return (
    <Shell>
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">
          Structured output from{" "}
          <span className="font-mono text-[var(--text)]">
            {lastResponse.model}
          </span>{" "}
          at {new Date(lastResponse.timestamp).toLocaleString()}.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Summary">{r.summary}</Card>
          <Card title="Classification">{r.classification}</Card>
          <Card title="Sensitivity">{r.sensitivity}</Card>
          <Card title="Confidence">
            {(r.confidence * 100).toFixed(0)}% ({r.confidence.toFixed(2)} raw)
          </Card>
        </div>

        <Card title="Extracted fields">
          <dl className="grid gap-2 sm:grid-cols-2 font-mono text-xs">
            {Object.entries(r.extracted_fields).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Missing information">
          <ul className="list-disc pl-5 space-y-1">
            {r.missing_information.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </Card>

        <Card title="Suggested owners">
          <ul className="flex flex-wrap gap-2">
            {r.suggested_owners.map((o, i) => (
              <li
                key={i}
                className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-xs border border-[var(--border)]"
              >
                {o}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Internal tasks">
          <ol className="list-decimal pl-5 space-y-1">
            {r.internal_tasks.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </Card>

        <Card title="Draft internal spec">
          <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--muted)]">
            {r.draft_internal_spec}
          </pre>
        </Card>

        <Card title="Draft customer response (internal review only)">
          <pre className="whitespace-pre-wrap font-mono text-xs">
            {r.draft_customer_response}
          </pre>
        </Card>

        <Card title="Risk notes">
          <ul className="list-disc pl-5 space-y-1">
            {r.risk_notes.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </Card>

        <Card title="Audit notes">
          <ul className="list-disc pl-5 space-y-1">
            {r.audit_notes.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </Card>

        <Card title="Recommended human approval">
          {r.recommended_human_approval ? (
            <span className="text-[var(--warn)]">Yes — required before commitments</span>
          ) : (
            <span className="text-[var(--muted)]">Not flagged as mandatory by model</span>
          )}
        </Card>
      </div>
    </Shell>
  );
}
