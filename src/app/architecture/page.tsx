"use client";

import { Card, PageHeader, Pill } from "@/components/Card";
import { MOCK_CONTEXT } from "@/lib/mockContext";

const CURRENT_FLOW: { step: string; detail: string }[] = [
  { step: "User", detail: "Sales / Ops / Software user submits a free-text request via the UI." },
  { step: "Next.js frontend", detail: "Client calls our own /api/analyse endpoint. No model API key in the browser." },
  { step: "/api/analyse (server only)", detail: "Validates request body with Zod. Reads OPENAI_API_KEY from server env. Builds the prompt." },
  { step: "Prompt builder", detail: "Combines a fixed system prompt + mocked retrieval snippets + the user request." },
  { step: "Mock retrieval context", detail: "Hardcoded MOCKED policy/intake snippets. Stand-in for a real RAG layer." },
  { step: "Live LLM API", detail: "Server-side call to the configured chat model. response_format = json_object." },
  { step: "Structured JSON parser", detail: "Robustly extracts the JSON object even if the model wraps it in fences." },
  { step: "Zod schema validation", detail: "Strict AnalysisSchema. Failures are surfaced cleanly." },
  { step: "Rule-based eval runner", detail: "Deterministic checks for structure, sensitivity, approval, commitments, owners, risk." },
  { step: "AI Analysis UI / Eval Suite UI", detail: "Cards render structured fields, draft spec, draft customer response, eval results." },
  { step: "Human approval / audit trail", detail: "Reviewer-facing page with hard guarantees and a visible audit trail." },
];

const FUTURE_HARDENING: { name: string; detail: string }[] = [
  { name: "SSO / RBAC", detail: "Identity-aware access, per-team scopes, reviewer roles." },
  { name: "Audit database", detail: "Immutable record of every request, prompt, output, eval, and approval decision." },
  { name: "Approved model gateway", detail: "Centralised, policy-controlled model proxy with logging, redaction, rate limits." },
  { name: "On-prem / private model option", detail: "For defence-sensitive workloads. Network-isolated inference." },
  { name: "CRM / ERP / ticketing integrations", detail: "Push approved tasks to Jira/Linear/CRM rather than living only in this UI." },
  { name: "Internal documentation retrieval", detail: "Real RAG over policies, runbooks, capability docs — replacing the mocked snippets." },
  { name: "Repo / CI / CD integrations", detail: "Future extension: AI-assisted internal development workflows triggered from approved tasks." },
  { name: "Secrets manager", detail: "Pull keys at runtime; rotate; never bake into env files." },
  { name: "Monitoring (cost / latency / failure rate)", detail: "Per-route and per-prompt SLOs, alerting, drift detection." },
  { name: "Human review workflow", detail: "Multi-reviewer approvals, escalation, comment threads, sign-off requirements." },
  { name: "Golden eval dataset", detail: "Curated request/expected-behaviour pairs gating prompt and model changes." },
  { name: "Security review", detail: "Threat modelling, prompt-injection testing, data-handling review before any real rollout." },
];

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="05 · Architecture"
        title="What this prototype is, and what production would add"
        description="Plain-English architecture. The current flow is intentionally small. The future hardening list below is what would have to be true before this touches real customer data."
      />

      <Card title="Current prototype architecture">
        <ol className="space-y-3">
          {CURRENT_FLOW.map((s, i) => (
            <li
              key={i}
              className="flex gap-3 items-start border-l-2 border-accent-500/60 pl-3"
            >
              <div className="text-[10px] font-mono text-accent-400 mt-0.5 w-6">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div className="text-sm text-ink-50 font-medium">{s.step}</div>
                <div className="text-xs text-ink-300">{s.detail}</div>
              </div>
            </li>
          ))}
        </ol>
        <pre className="mt-4 text-xs font-mono text-ink-200 bg-ink-900 rounded p-3 border border-ink-700 overflow-x-auto">
{`User
  → Next.js frontend
  → /api/analyse (server only)
    → Prompt builder
    → Mock retrieval context
    → Live LLM API
    → Structured JSON parser
    → Zod schema validation
    → Rule-based eval runner
  → AI Analysis UI + Eval Suite UI
  → Human approval / audit trail`}
        </pre>
      </Card>

      <Card
        title="Future production architecture"
        subtitle="Not implemented in this prototype."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FUTURE_HARDENING.map((f, i) => (
            <div
              key={i}
              className="rounded border border-ink-700 bg-ink-900/60 p-3"
            >
              <div className="flex items-center gap-2">
                <Pill tone="warn">not implemented</Pill>
                <span className="text-sm text-ink-100 font-medium">
                  {f.name}
                </span>
              </div>
              <p className="text-xs text-ink-300 mt-1">{f.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Mocked retrieval context (used in the prompt)"
        subtitle="Hardcoded stand-ins for a real RAG layer. Clearly labelled MOCKED."
      >
        <ul className="space-y-2">
          {MOCK_CONTEXT.map((m) => (
            <li
              key={m.id}
              className="rounded border border-ink-700 bg-ink-900/40 p-3"
            >
              <div className="text-sm text-ink-100 font-medium">{m.title}</div>
              <p className="text-xs text-ink-300 mt-1">{m.body}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Possible future extension (out of scope here)">
        <p className="text-ink-200 text-sm leading-relaxed">
          AI-assisted internal development workflows (spec → scaffold → PR) are
          a natural extension once approved internal tasks exist as structured
          objects. This prototype intentionally does <em>not</em> implement that
          — the focus here is on safe request triage between Sales/customer
          teams and Software/Ops.
        </p>
      </Card>
    </div>
  );
}
