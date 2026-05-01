# How This Works

AI Request Triage is a role-based internal request triage prototype for a fast-growing dual-use deep-tech company.

Turns messy sales/customer requests into structured, reviewable work for software and operations teams.

## Prototype navigation

Sales Portal | Head of Software Queue | How it Works

## Workflow

1. Sales submits a customer or internal request in plain language.
2. The frontend sends the request brief to the server-only `/api/analyse` route.
3. In local development, the server reads `OPENAI_API_KEY` directly from `.env.local` and ignores shell-exported keys.
4. In production, the server reads `OPENAI_API_KEY` from the host's secure server-side environment variables, such as Vercel Project Settings.
5. The server adds mocked context snippets and calls the configured LLM.
6. The model returns structured triage JSON.
7. Zod validates the response shape.
8. Local safety checks flag missing information, sensitivity, unsupported commitments, owner routing, and software-interrupt risk.
9. The Head of Software Queue shows the clean request, audit trail, and safety checks.
10. The reviewer asks Sales for clarification, routes to Software/Ops/Security, approves discovery, or rejects/not-now.

## What the prototype protects

- Software and operations focus
- Customer-facing commitments
- Defence-sensitive or customer-confidential context
- Auditability of AI-assisted routing decisions
- Server-side API key handling

## Prototype boundary

This prototype uses a live server-side LLM call, mocked context, Zod validation, local safety checks, and no real Kelluu data. It does not connect to CRM, ERP, ticketing, repos, internal docs, production systems, or persistent audit storage.
