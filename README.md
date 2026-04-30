# AI Request Backbone — Kelluu Core AI Architect Prototype

## Context

This prototype was built by/for Sagar Dubey as a demonstration for the Kelluu Core AI Architect application. It explores how messy sales/customer/ops requests could be turned into structured, auditable, human-reviewable internal AI workflows.

Kelluu is positioned publicly around persistent autonomous aerial data for defence, critical infrastructure, digital twins, environmental intelligence, and complex operating environments. This prototype uses that public positioning only to shape product messaging. It does not use confidential Kelluu data.

## What it demonstrates

- live LLM-based request analysis
- structured JSON output
- mocked retrieval context
- sensitivity classification
- missing-information detection
- owner routing
- human approval gates
- lightweight evals
- auditability
- production architecture thinking

## What is real

- live LLM API call
- server-side API route
- structured output
- Zod schema validation
- local rule-based evals
- mocked context injection
- UI flow
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

## Why evals are included

AI tools used in operational workflows need quality gates before rollout. The seed eval harness checks structure, safety, missing information, approval behavior, owner routing, risk notes, and unsupported commitments. These checks are lightweight and useful for fast iteration, but they are not proof of full production safety.

## Architecture

See `docs/ARCHITECTURE.md` for the business problem, runtime flow, security boundary, local runbook, and advisory notes.

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

- API key is server-side only.
- `.env.local` is ignored.
- No confidential Kelluu data is used.
- No external actions are taken.
- No production systems are connected.
- Customer-facing drafts require human approval.
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

Never use `NEXT_PUBLIC_OPENAI_API_KEY`. The browser calls `/api/analyse`; only the server route calls OpenAI.

## How to test locally

Run automated checks:

```bash
npm run test
npm run build
```

Manual paths:

1. App startup: run `npm install`, `cp .env.example .env.local`, and `npm run dev`; expect the app at http://localhost:3000 with a visible sample request and no hydration errors.
2. Missing API key: remove `OPENAI_API_KEY` from `.env.local`, restart dev server, click “Analyse with AI”; expect a clear missing-key error and no exposed key or stack trace.
3. Defence RFI: expect non-low sensitivity, human approval, missing AOI/cadence/latency/delivery/feasibility details, cautious customer draft, Sales plus technical/security owners, and mostly passing evals.
4. Vague sales request: expect clarification questions, no immediate urgent software build, Sales/Product/Software review, and missing-information eval coverage.
5. Unsafe promise: expect a block/caution against autonomous customer promises, human approval, feasibility caveats, defence/customer risk flags, and no unsupported commitment language.
6. Internal ops dashboard: expect internal software/ops classification, missing data sources, Ops/Software/Product/Security owners, integration and permission risks, and reasonable tasks.
7. Eval Suite: expect score, individual pass/fail/warning checks, and “This is a seed eval harness, not proof of full safety.”
8. Architecture page: expect current architecture, future production architecture, and future items marked not implemented.
9. README: expect real/mocked scope, eval rationale, run instructions, security notes, and architecture diagram.

## Production deployment notes

- Set `OPENAI_API_KEY` and `AI_MODEL` as environment variables in Vercel.
- Never expose the API key to the browser.
- Configure domain and deployment environment.
- Monitor usage and costs.
- Add authentication before any real deployment.
- Do not use real company or customer data until security review.

## Future hardening

- SSO/RBAC
- audit DB
- approved model gateway
- on-prem/private model option
- secrets manager
- prompt-injection testing
- golden eval dataset
- regression tests before model/prompt changes
- integration with ticketing/CRM/docs/repos
- monitoring for cost/latency/failure rates
- AI-assisted development workflows as a later extension, after request triage and audit foundations are stable
