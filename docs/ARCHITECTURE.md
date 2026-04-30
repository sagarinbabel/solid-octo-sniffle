# AI Request Backbone Architecture

## Business problem

Sales, customer-facing, and operations teams often receive ambiguous requests that can interrupt software and operations teams before the real work is understood. In a dual-use deep-tech environment, those requests can also carry sensitivity, feasibility, delivery, and customer-commitment risk.

AI Request Backbone turns those messy requests into structured, reviewable, auditable internal work:

- discover the real request
- classify sensitivity and customer-facing risk
- identify missing information
- suggest owners
- draft internal tasks/specs
- keep humans in the loop before commitments
- run lightweight evals before trusting the output
- avoid connecting prototype code to real customer/company systems

## Current prototype architecture

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

## Runtime flow

1. The user enters or selects a messy request in the browser.
2. The frontend sends `{ requestText }` to `/api/analyse`.
3. The server route validates the input.
4. The server route attaches hardcoded mocked context snippets.
5. The server route calls the OpenAI SDK using `OPENAI_API_KEY` from server-side environment variables.
6. The model returns JSON.
7. The server parses and validates the JSON with Zod.
8. The server runs rule-based evals.
9. The UI renders the analysis, approval/audit state, and eval results.

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

Do not create `NEXT_PUBLIC_OPENAI_API_KEY`. The API key must stay server-side.

## Testing

```bash
npm run test
npm run lint
npm run build
```

Manual checks:

- app loads at `http://localhost:3000`
- sample request is visible
- missing API key shows a safe UI error
- defence/unsafe/customer-facing requests require human approval
- eval suite shows score and pass/fail/warning checks
- architecture page clearly separates implemented and not implemented capabilities

## Security boundary

- No Kelluu confidential data is used.
- Mocked context is hardcoded and labeled mocked.
- No external action is taken.
- No CRM, ERP, ticketing, repo, or internal-doc integration is implemented.
- Customer-facing drafts require human approval.
- The browser never receives the OpenAI API key.
- Production use would require auth, audit storage, approved model gateway, monitoring, and security review.

## Current npm advisory note

`npm audit` reports a moderate PostCSS advisory through Next.js:

- Advisory: `GHSA-qx2v-qp2m-jg93`
- Package path: `next@16.2.4 -> postcss@8.4.31`
- Direct app PostCSS users are already on `postcss@8.5.12`.
- The npm suggested fix downgrades Next to `9.3.3`, which is not appropriate for this App Router prototype.

How much to care:

- For this prototype, risk is low because the app does not stringify user-controlled CSS.
- For production, track the next patched Next.js release and update promptly.
- Do not use `npm audit fix --force` here unless you intentionally want to replace the framework version and re-test the app.

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
