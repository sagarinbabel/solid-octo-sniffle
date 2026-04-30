# AI Request Backbone — Kelluu Core AI Architect Prototype

> A lightweight internal AI workflow backbone that turns messy sales / customer / ops requests into structured, reviewable, auditable work — before they interrupt software and operations teams.

## Context

This prototype was built by [Sagar Dubey](https://github.com/) as a demonstration for the **Core AI Architect** application at **Kelluu**. It explores how messy sales / customer / ops requests could be turned into structured, auditable, human-reviewable internal AI workflows.

It is intentionally a 75–80% prototype. The point is to show the shape of how an internal AI tool at Kelluu could be approached — discover the real request, structure it, classify sensitivity, identify missing information, suggest owners, generate internal tasks/specs, require human approval, run lightweight evals, and keep auditability visible — without making unsupported commitments or pretending to be production-safe.

> Important: this prototype does not use real Kelluu data. All retrieval context is mocked and clearly labelled `MOCKED`. The company name is **Kelluu** (not Kelloo).

## What it demonstrates

- Live LLM-based request analysis (server-side call, not browser-side)
- Strict structured JSON output validated with Zod
- Mocked retrieval context injected into the prompt (stand-in for a real RAG layer)
- Sensitivity classification (defence / customer-facing / internal)
- Missing-information detection
- Owner routing across Sales / Operations / Software / Security / Compliance / Product / Delivery
- Human approval gate as a deliberate, visible step
- Lightweight rule-based eval suite
- Visible audit trail
- Production architecture thinking (with a clear "not implemented" list)

## What is real

- Live LLM API call via the OpenAI SDK
- Server-side Next.js API route (`/api/analyse`) — the API key never reaches the browser
- Structured output with Zod schema validation
- Local rule-based evals
- Mocked context injection into the prompt
- UI flow across five tabs (Intake → Analysis → Approval & Audit → Eval Suite → Architecture)
- Local testing path (`npm install && npm run dev`)

## What is mocked

- Kelluu internal data (none used)
- CRM / ERP / ticketing integrations
- RBAC / SSO
- On-prem deployment
- Internal documentation retrieval (replaced by hardcoded snippets clearly labelled `MOCKED`)
- Persistent audit database (the audit trail is rendered in the UI per request, not persisted)
- Production monitoring (cost / latency / failure rate)
- Real customer workflows

## Why evals are included

AI tools used in operational workflows need quality gates. The included evals check:

- valid structured JSON
- required fields present
- missing-information detection
- sensitivity classification (defence / security / government keywords must not be `low`)
- human approval requirement (true for customer-facing or defence-related requests)
- no unsupported commitments in the draft customer response
- sensible owner routing (≥ 2 from Sales / Operations / Software / Security / Compliance / Product / Delivery)
- risk notes present for sensitive / customer-facing requests

These are deterministic, in-process, fast enough to gate every analysis. They are **a seed eval harness, not proof of full safety**. Production would add a golden eval dataset, regression tests on prompt/model changes, adversarial / prompt-injection probes, and sampled human grading.

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

The Architecture tab inside the app explains the same flow in plain English and lists everything that is intentionally not implemented yet.

## Security assumptions

- The LLM API key is **server-side only**, read from `process.env.OPENAI_API_KEY` inside the Next.js API route.
- `.env.local` is in `.gitignore` and must never be committed.
- No `NEXT_PUBLIC_*` variant is used for the API key. Anything `NEXT_PUBLIC_*` is shipped to the browser, so the key would leak.
- The browser only ever calls our own `/api/analyse` endpoint with a request body of `{ requestText: string }`.
- The server returns sanitised errors. Stack traces and upstream error bodies are not exposed to the frontend; useful detail is logged server-side only.
- No real Kelluu / customer data is used. Mocked retrieval snippets are clearly labelled `MOCKED`.
- No external action is taken: nothing is emailed, no ticket is created, no commitment is sent.
- Customer-facing drafts require human approval. The approval gate is shown as a visible, deliberate step.
- A real production deployment would need security review, prompt-injection testing, RBAC, audit DB, model gateway, etc. (see the Architecture page).

## How to run locally

```bash
npm install
cp .env.example .env.local
# edit .env.local and set OPENAI_API_KEY=sk-...
# optional: change AI_MODEL (default: gpt-4.1-mini)
npm run dev
```

Open <http://localhost:3000>.

### Where to put the API key

In `.env.local` only, at the project root:

```
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4.1-mini
```

`.env.local` is gitignored. Never commit it. Never paste the key into any frontend file.

## How to test locally

### Unit tests

```bash
npm test
```

This runs the Vitest suite for the eval engine.

### Manual tests

1. **App startup** — `npm run dev`, open <http://localhost:3000>, see the Request Intake page with sample request buttons.
2. **Missing API key** — leave `OPENAI_API_KEY` empty, restart the dev server, click *Analyse with AI*. The UI should show a clear missing-key error. The app must not crash and must not expose any stack trace.
3. **Defence RFI** — pick sample 1. Expect: sensitivity not `low`; human approval `REQUIRED`; missing-information lists AOI / cadence / latency / delivery format / feasibility constraints; draft customer response cautious; owners include at least Sales plus Operations / Software / Security; evals mostly pass.
4. **Vague sales request** — pick sample 2. Expect: missing-info asks for customer, use case, deadline, demo goal, available data, owner; suggests Sales / Product / Software review rather than an immediate urgent build; eval detects missing-info handling.
5. **Unsafe promise** — pick sample 4. Expect: blocks / cautions against an autonomous customer promise; human approval `REQUIRED`; flags customer-facing / defence-sensitive risk; draft response does not promise capability; the *no unsupported commitments* eval passes.
6. **Internal ops dashboard** — pick sample 5. Expect: classified as internal software / ops workflow; identifies missing data sources; suggests Ops / Software / Product / Security; flags integration and permissions; reasonable internal tasks.
7. **Eval Suite** — open the Eval Suite tab. See score percentage, individual checks (pass / fail / warning), and the explicit *seed eval harness, not proof of full safety* note. Optionally run all samples.
8. **Architecture** — open the Architecture tab. Current prototype architecture and future production architecture are both visible; future items are clearly marked *not implemented*.

## Production deployment notes (Vercel)

- Set `OPENAI_API_KEY` and `AI_MODEL` as environment variables in the Vercel project settings (Production / Preview / Development as needed).
- Never expose the API key to the browser. Do not introduce `NEXT_PUBLIC_OPENAI_API_KEY`.
- Configure the domain and environment as appropriate.
- Monitor usage and cost from the model provider dashboard.
- Add authentication (SSO/RBAC) before any non-demo deployment.
- Do not load real company / customer data until a security review has been completed.

## Future hardening (not implemented)

- SSO / RBAC
- Audit database
- Approved model gateway / on-prem or private model option
- Secrets manager (rotate keys, no env files)
- Prompt-injection testing
- Golden eval dataset
- Regression tests gating model / prompt changes
- Integration with ticketing / CRM / docs / repos
- Monitoring for cost, latency, failure rates
- AI-assisted internal development workflows (spec → scaffold → PR) as a possible future extension built on top of the same approved-task layer

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zod
- OpenAI SDK
- Vitest
