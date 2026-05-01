# AI Request Triage — Kelluu Core AI Architect Prototype

## Context

This prototype was built by/for Sagar Dubey as a demonstration for the Kelluu Core AI Architect application. It translates a broad need for an internal AI workflow backbone into a concrete request-triage workflow for Sales, customer-facing teams, Software, and Operations.

Kelluu is positioned publicly around persistent autonomous aerial data for defence, critical infrastructure, digital twins, environmental intelligence, and complex operating environments. This prototype uses that public positioning only to shape product messaging. It does not use confidential Kelluu data.

## Business problem

Fast-growing dual-use deep-tech companies can lose engineering focus when vague customer or internal requests arrive as urgent software interruptions. AI Request Triage turns messy sales/customer requests into structured, reviewable work for software and operations teams.

## What it demonstrates

- live server-side LLM-based request triage
- structured JSON output
- mocked retrieval context
- sensitivity and risk classification
- missing-information detection
- recommended routing and next action
- software-interrupt gating
- local safety checks inside the Head of Software Queue
- auditability and human review
- production architecture thinking

## What is real

- live LLM API call
- server-side Next.js API route
- structured output
- Zod schema validation
- local rule-based safety checks
- mocked context injection
- role-based UI flow
- local testing path

## What is mocked

- Kelluu internal data
- CRM/ERP/ticketing integrations
- RBAC/SSO
- on-prem deployment
- internal documentation retrieval
- persistent audit database
- production monitoring
- real customer workflows

## Architecture

See `docs/ARCHITECTURE.md` for the runtime flow, security boundary, on-prem/private model note, local runbook, and advisory notes. See `docs/HOW_THIS_WORKS.md` for the role-based workflow explanation.

```mermaid
flowchart TD
    A[Sales / Customer-Facing User] --> B[Sales Portal]
    B --> C[/api/analyse - Server Only]
    C --> D[Prompt Builder]
    D --> E[Mock Retrieval Context]
    D --> F[Live LLM API]
    F --> G[Structured JSON Parser]
    G --> H[Zod Schema Validation]
    H --> I[Local Safety Check Runner]
    I --> J[Head of Software Queue]
    J --> K[Route / Reject / Approve Discovery / Ask Clarification]
    K --> L[Local Status Update + Audit Trail]

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

- In local development, the API key is loaded server-side only from `.env.local`.
- In production, the API key is loaded from the host's server-side environment variables, such as Vercel Project Settings.
- Shell-exported `OPENAI_API_KEY` values are intentionally ignored during local development for safety.
- `.env.local` is ignored.
- No confidential Kelluu data is used.
- No external actions are taken.
- No production systems are connected.
- Customer-facing commitments require human approval.
- Real production use would need security review.

## How to run locally

```bash
npm install
cp .env.example .env.local
# add OPENAI_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000.

## Where to add the API key

Copy `.env.example` to `.env.local`, then add your key:

```bash
OPENAI_API_KEY=your_server_side_key
AI_MODEL=gpt-4.1-mini
```

Never use `NEXT_PUBLIC_OPENAI_API_KEY`. The browser calls `/api/analyse`; only the server route calls OpenAI. Local development reads `OPENAI_API_KEY` from `.env.local` and ignores keys exported in your shell environment. Production reads `OPENAI_API_KEY` from secure server-side hosting settings.

## How to test locally

Run automated checks:

```bash
npm run test
npm run lint
npm run build
```

Manual paths:

1. App startup: run `npm install`, `cp .env.example .env.local`, and `npm run dev`; expect the Sales Portal at http://localhost:3000.
2. Missing API key: remove `OPENAI_API_KEY` from `.env.local`, restart dev server, click “Submit for AI triage”; expect a clear missing-key error and no stack trace.
3. Sales Portal: fill the customer/opportunity, request summary, deadline, software/ops need, commitment, and sensitivity fields.
4. Head of Software Queue: verify submitted/seeded requests show status, deadline, sensitivity, missing info count, and suggested route.
5. Queue detail: verify original request, clean title, summary, urgency, business value, technical complexity, suggested next action, software-interrupt gate, clarification draft, risk flags, recommended status, safety checks, and audit trail.
6. Queue actions: click Ask Sales for clarification, Route to Software, Route to Ops, Route to Security, Approve discovery, and Reject / not now; expect local status updates.
7. How it Works: verify the six-step explanation and prototype boundary statement.

## Production deployment notes

- Set `OPENAI_API_KEY` and `AI_MODEL` as environment variables in Vercel.
- Never expose the API key to the browser.
- Do not commit `.env.local`; production secrets belong in Vercel Project Settings or a secrets manager.
- Configure domain and deployment environment.
- Monitor usage and costs.
- Add authentication before any real deployment.
- Do not use real company or customer data until security review.
- For sensitive production workflows, prefer a company-controlled deployment and private/on-prem model path by default.

## Future hardening

- See `TODO.md` for next prototype UX improvements.
- SSO/RBAC
- audit DB
- approved model gateway
- on-prem/private model option
- secrets manager
- prompt-injection testing
- golden safety-check dataset
- regression tests before model/prompt changes
- integration with ticketing/CRM/docs/repos
- monitoring for cost/latency/failure rates
- AI-assisted development workflows as a later extension, after request triage and audit foundations are stable
