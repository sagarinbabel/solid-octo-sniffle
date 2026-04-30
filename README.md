# AI Request Backbone — Kelluu Core AI Architect Prototype

## Context

This prototype was built by/for **Sagar Dubey** as a demonstration for the **Kelluu** (not “Kelloo”) **Core AI Architect** application. It explores how messy sales, customer, and operations requests could be turned into structured, auditable, human-reviewable internal AI workflows—aligned with Kelluu’s domain of persistent aerial intelligence, dual-use operations, and high operational complexity—**without** using any confidential Kelluu data.

## What it demonstrates

- Live LLM-based request analysis (server-side only)
- Structured JSON output with a fixed schema
- Mocked retrieval context (clearly labeled **MOCKED**)
- Sensitivity classification and missing-information detection
- Owner routing suggestions
- Human approval gates (recommended flag + audit UI)
- Lightweight, rule-based eval harness
- Auditability surfaced in the UI
- Production-oriented separation: browser → `/api/analyse` → OpenAI (no key in client)

## What is real

- Live OpenAI API call from a Next.js Route Handler
- Server-side API route (`POST /api/analyse`)
- Structured output, JSON parsing, and **Zod** validation
- Local rule-based evals
- Mocked context injection in the prompt
- End-to-end UI flow and local development path

## What is mocked

- Kelluu internal data, policies, and systems
- CRM / ERP / ticketing integrations
- RBAC / SSO
- On-prem deployment and private model routing
- Internal documentation retrieval
- Persistent audit database
- Production monitoring and alerting
- Real customer workflows and identities

## Why evals are included

Operational AI tools need **measurable quality gates** before rollout. The included checks look at structure, sensitivity handling, approval behaviour, owner routing, missing-information depth, and disallowed commitment language in drafts. They are intentionally **lightweight seed evals**: they demonstrate engineering discipline and catch obvious failure modes—they are **not** proof of full production safety.

## Architecture

```mermaid
flowchart TD
    A[User: Sales / Ops / Software] --> B[Next.js Frontend]
    B --> C[/api/analyse - Server Only]
    C --> D[Prompt Builder]
    D --> E[Mock Retrieval Context]
    D --> F[Live LLM API]
    F --> G[Structured JSON Parser]
    G --> H[Zod Schema Validation]
    H --> I[Rule-Based Eval Runner]
    I --> J[AI Analysis UI]
    I --> K[Eval Suite UI]
    J --> L[Human Approval / Audit Trail]

    subgraph Future Production Hardening - Not Implemented
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
    I -. future .-> T
```

## Security assumptions

- **API key is server-side only** — never `NEXT_PUBLIC_*`, never imported in client components for LLM calls
- `.env.local` is gitignored; use `.env.example` as the template
- **No confidential Kelluu data** is embedded; context snippets are fictional placeholders
- **No external actions** are taken (no email, no tickets, no repo writes)
- **No production systems** are connected
- Customer-facing **drafts require human approval** in a real deployment; here the UI states that explicitly
- Real production use would require threat modelling, authN/Z, data classification, and security review

## How to run locally

```bash
npm install
cp .env.example .env.local
# Edit .env.local: set OPENAI_API_KEY (and optionally AI_MODEL)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Where to put the key:** add `OPENAI_API_KEY` to `.env.local` (created from `.env.example`). Never commit `.env.local`.

## How to test locally

```bash
npm run lint
npm test
```

**Manual checks (recommended):**

1. **App startup** — `npm run dev`, load `/`, pick a sample request, no blank screen / hydration errors.
2. **Missing API key** — remove `OPENAI_API_KEY` from `.env.local`, restart dev server, click “Analyse with AI”; expect a clear error JSON message, no key in the browser, no stack trace in UI.
3. **Defence RFI sample** — sensitivity not “low”, human approval true, rich missing info, cautious draft, eval score mostly healthy.
4. **Vague sales sample** — clarification-heavy tasks, Sales/Product/Software style routing.
5. **Unsafe promise sample** — model cautions; eval “no unsupported commitments” should pass if the draft avoids banned phrases.
6. **Ops dashboard sample** — internal workflow framing, integration/permissions risks.
7. **Eval Suite tab** — score, pass/fail/warning, seed harness disclaimer; optional “all sample cases” batch.
8. **Architecture tab** — current vs future (not implemented) paths visible.
9. **README** — you are reading it; diagram and security notes present.

## Production deployment notes (e.g. Vercel)

- Set **`OPENAI_API_KEY`** and **`AI_MODEL`** in the project’s environment variables (server-side)
- **Never** expose the API key to the browser
- Configure domain / preview environments appropriately
- Monitor usage, cost, and latency
- Add **authentication and authorization** before any real internal rollout
- Do not load real company or customer data until security review

## Future hardening

- SSO / RBAC and org-scoped tenancy
- Append-only audit database
- Approved model gateway (routing, caching, policy)
- On-prem / private model option
- Central secrets manager
- Prompt-injection testing and red teaming
- Golden eval dataset and regression tests before prompt/model changes
- Integrations: ticketing, CRM, internal docs, repos, CI/CD
- Monitoring for cost, latency, and failure rates; SLOs for the workflow service

## AI-assisted development (out of scope)

This prototype targets **request triage** between customer-facing teams and Software/Ops. A separate “AI coding backbone” product is **not** implemented. Connecting similar governance patterns (approval, evals, audit) to **AI-assisted software development** is a plausible future extension mentioned here for completeness only.

## Licence

Private prototype for job application context; adjust as needed for the hosting repository.
