# How This Works

AI Request Triage is a role-based internal request triage prototype for a fast-growing dual-use deep-tech company.

Turns messy sales/customer requests into structured, reviewable work for software and operations teams.

## Prototype navigation

Sales Portal | Head of Software Queue | How it Works

## Two entry points (main vs `/prototype`)

- The main app flow (the default navigation) demonstrates the request triage workflow.
- The `/prototype` route is an alternative UI for the same workflow. It uses mocked/seeded data and is meant for layout and interaction exploration.

## Workflow

1. Sales submits a customer or internal request in plain language.
2. The frontend sends the request brief to the server-only `/api/analyse` route.
3. In local development, the server reads `NVIDIA_API_KEY` directly from `.env.local` and ignores shell-exported keys.
4. In production, the server reads `NVIDIA_API_KEY` from the host's secure server-side environment variables, such as Vercel Project Settings.
5. The server adds mocked context snippets and calls the configured LLM (unless `AI_FORCE_LOCAL=1` is enabled).
6. The model returns structured triage JSON (or, on timeout, the server can return a local heuristic triage when `AI_ENABLE_LOCAL_FALLBACK=1`).
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

This prototype uses a live server-side LLM call, mocked context, Zod validation, local safety checks, and no real airship company data. It does not connect to CRM, ERP, ticketing, repos, internal docs, production systems, or persistent audit storage.
