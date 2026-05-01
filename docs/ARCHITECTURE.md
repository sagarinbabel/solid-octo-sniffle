# AI Request Triage Architecture

## Business problem

Fast-growing dual-use deep-tech teams often get urgent, ambiguous requests from Sales, customers, and operations. Those requests can pull software and operations teams into meetings or builds before the real ask is clear.

AI Request Triage creates a role-based workflow:

- Sales submits customer/internal requests in plain language.
- AI structures the request and flags missing information.
- Local safety checks evaluate routing, sensitivity, unsupported commitments, and interrupt risk.
- The Head of Software reviews a clean queue before software or operations teams are interrupted.
- The reviewer can route, reject, approve discovery, or ask Sales for clarification.

Pauli described a need for a backbone; this prototype translates that into a concrete request-triage workflow.

## Current prototype architecture

```mermaid
flowchart TD
    A[Sales / Customer-facing user] --> B[Sales Portal]
    B --> C[/api/analyse - Server Only]
    C --> D[Prompt Builder]
    D --> E[MOCKED Context Snippets]
    D --> F[Live LLM API]
    F --> G[Structured JSON Parser]
    G --> H[Zod Schema Validation]
    H --> I[Local Safety Checks]
    I --> J[Head of Software Queue]
    J --> K[Route / Reject / Approve Discovery / Ask Clarification]
    K --> L[Local Status Update and Audit Trail]

    subgraph Future Production Hardening - Not Implemented
        M[SSO / RBAC]
        N[Audit Database]
        O[Internal Model Gateway]
        P[On-Prem / Private Model]
        Q[CRM / ERP / Ticketing]
        R[Internal Docs Retrieval]
        S[Secrets Manager]
        T[Monitoring: Cost / Latency / Failure Rate]
    end

    C -. future .-> M
    L -. future .-> N
    F -. future .-> O
    O -. future .-> P
    C -. future .-> Q
    D -. future .-> R
    C -. future .-> S
    I -. future .-> T
```

## Runtime flow

1. Sales fills in customer/opportunity, request summary, deadline, Software/Ops need, commitment flag, and sensitivity.
2. The browser sends a composed request brief to `/api/analyse`.
3. The server route validates input.
4. The server attaches hardcoded mocked context snippets.
5. The server calls the OpenAI SDK using `OPENAI_API_KEY` from server-side environment variables.
6. The model returns the exact triage JSON shape.
7. The server parses and validates JSON with Zod.
8. Local safety checks run server-side.
9. The Sales Portal adds the request to a local queue.
10. The Head of Software Queue shows the structured request, safety checks, audit trail, and local routing actions.

## How to run locally

```bash
npm install
cp .env.example .env.local
# add OPENAI_API_KEY to .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

```bash
OPENAI_API_KEY=your_server_side_key
AI_MODEL=gpt-4.1-mini
```

Do not create `NEXT_PUBLIC_OPENAI_API_KEY`. The API key must stay server-side. For local development, the API route intentionally reads `OPENAI_API_KEY` from `.env.local` only and ignores shell-exported keys, so accidental terminal environment secrets are not used.

## Testing

```bash
npm run test
npm run lint
npm run build
```

Manual checks:

- app loads with `AI Request Triage`
- nav shows `Sales Portal`, `Head of Software Queue`, and `How it Works`
- Sales Portal can submit or safely show the missing-key error
- Head of Software Queue shows safety checks inside the selected request detail
- action buttons update request status locally
- How it Works explains the six-step workflow and prototype boundary

## Security boundary

- No Kelluu confidential data is used.
- Mocked context is hardcoded and labeled mocked.
- No external action is taken.
- No CRM, ERP, ticketing, repo, or internal-doc integration is implemented.
- In local development, the server reads `OPENAI_API_KEY` from `.env.local` only.
- In production, the server reads `OPENAI_API_KEY` from the host's encrypted server-side environment settings, such as Vercel Environment Variables.
- The browser never receives the OpenAI API key.
- Production use would require auth, audit storage, approved model gateway, monitoring, and security review.

## On-prem and confidential deployment note

For real internal use, the safest deployment pattern is to keep the app, retrieval index, logs, audit store, model gateway, and model runtime inside the company-controlled environment. That can mean a private Kubernetes or VM deployment, internal network access only, SSO/RBAC, private object storage, a secrets manager, encrypted audit logs, and a self-hosted model such as an approved open-weight LLM served through an internal gateway.

If the workflow handles defence-sensitive, customer-sensitive, export-controlled, regulated, or proprietary operational data, default to an on-prem or private-cloud model path. In that mode, prompts, retrieved documents, embeddings, model outputs, traces, and eval datasets never leave the company boundary. The model gateway should enforce allow-listed models, data-retention policy, prompt logging controls, rate limits, redaction, access review, and human approval rules before any customer-facing use.

Cloud models can still be considered for lower-sensitivity workflows, but only behind a controlled model gateway rather than direct application calls. The gateway should redact or minimize inputs, block restricted data classes, use enterprise agreements with no training on submitted data, disable provider-side retention where available, route by sensitivity level, maintain auditable request metadata, and provide an emergency kill switch. Sensitive retrieval documents should not be sent to an external model unless security, legal, and customer commitments explicitly allow it.

## Current npm advisory note

`npm audit` reports a moderate PostCSS advisory through Next.js:

- Advisory: `GHSA-qx2v-qp2m-jg93`
- Package path: `next@16.2.4 -> postcss@8.4.31`
- Direct app PostCSS users are already on `postcss@8.5.12`
- The npm suggested fix downgrades Next to `9.3.3`, which is not appropriate for this App Router prototype

For this prototype, risk is low because the app does not stringify user-controlled CSS. For production, track the next patched Next.js release and update promptly.

## Future production architecture

Not implemented in this prototype:

- SSO/RBAC
- audit database
- approved model gateway
- on-prem/private model option
- CRM/ERP/ticketing integrations
- internal documentation retrieval
- repo/CI/CD integrations
- secrets manager
- monitoring for cost/latency/failure rate
- human review workflow
- golden eval dataset
- security review
