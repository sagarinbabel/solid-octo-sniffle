import { Shell } from "@/components/Shell";

export default function ArchitecturePage() {
  return (
    <Shell>
      <div className="space-y-10 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-[var(--text)] mb-3">
            Current prototype (implemented)
          </h2>
          <p className="text-[var(--muted)] mb-4">
            Plain-English flow: a user pastes a messy request in the Next.js
            frontend. The browser calls only our{" "}
            <code className="text-[var(--text)]">/api/analyse</code> route. The
            server builds a prompt, injects hardcoded mocked retrieval snippets,
            calls the live LLM, parses JSON, validates with Zod, runs local
            rule-based evals, and returns structured data for the UI and audit
            views. No API keys ever leave the server.
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-[var(--muted)]">
            <li>User</li>
            <li>Next.js frontend</li>
            <li>
              <code className="text-[var(--text)]">/api/analyse</code>
            </li>
            <li>Server-side prompt builder</li>
            <li>Mocked retrieval context</li>
            <li>Live LLM API</li>
            <li>Structured JSON parser</li>
            <li>Zod schema validation</li>
            <li>Rule-based eval runner</li>
            <li>UI rendering</li>
            <li>Human approval / audit trail (display only)</li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text)] mb-3">
            Future production architecture{" "}
            <span className="text-[var(--warn)] text-xs font-normal uppercase tracking-wide">
              — not implemented
            </span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[var(--muted)]">
            <li>SSO / RBAC</li>
            <li>Audit database</li>
            <li>Approved model gateway</li>
            <li>On-prem / private model option</li>
            <li>CRM / ERP / ticketing integrations</li>
            <li>Internal documentation retrieval</li>
            <li>Repo / CI/CD integrations</li>
            <li>Secrets manager</li>
            <li>Monitoring: cost, latency, failure rate</li>
            <li>Human review workflow (state machine)</li>
            <li>Golden eval dataset & regression gates</li>
            <li>Security review & prompt-injection programme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text)] mb-3">
            Diagram (also in README)
          </h2>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 overflow-x-auto text-xs font-mono text-[var(--muted)] whitespace-pre">
            {`flowchart TD
    A[User: Sales / Ops / Software] --> B[Next.js Frontend]
    B --> C[/api/analyse - Server Only/]
    C --> D[Prompt Builder]
    D --> E[Mock Retrieval Context]
    D --> F[Live LLM API]
    F --> G[Structured JSON Parser]
    G --> H[Zod Schema Validation]
    H --> I[Rule-Based Eval Runner]
    I --> J[AI Analysis UI]
    I --> K[Eval Suite UI]
    J --> L[Human Approval / Audit Trail]

    subgraph Future["Future Production Hardening - Not Implemented"]
        M[SSO / RBAC]
        N[Audit Database]
        O[On-Prem Model Gateway]
        P[CRM / ERP / Ticketing]
        Q[Internal Docs Retrieval]
        R[CI/CD and Security Scanners]
        S[Secrets Manager]
        T[Monitoring: Cost / Latency / Failure Rate]
    end

    C -. future .-> M
    L -. future .-> N
    F -. future .-> O
    C -. future .-> P
    D -. future .-> Q
    C -. future .-> R
    C -. future .-> S
    I -. future .-> T`}
          </div>
          <p className="text-xs text-[var(--muted)] mt-2">
            Mermaid source lives in the README for GitHub rendering. This page
            shows the same graph as text for environments without diagram
            rendering.
          </p>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 text-xs text-[var(--muted)]">
          <strong className="text-[var(--text)]">Note:</strong> AI-assisted
          software development pipelines are a plausible extension of this
          backbone but are intentionally out of scope for this prototype; the
          focus is request triage between customer-facing teams and
          Software/Ops.
        </section>
      </div>
    </Shell>
  );
}
