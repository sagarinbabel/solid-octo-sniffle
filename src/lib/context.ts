export const mockedContextSnippets = [
  {
    title: "MOCKED Sales RFI Intake Checklist",
    body: "Every customer-facing request should include customer type, use case, geography/AOI, deadline, requested output, delivery format, and decision owner.",
  },
  {
    title: "MOCKED Defence-Sensitive Data Handling Policy",
    body: "Defence-sensitive or government-related requests require human approval before any customer-facing commitment. Sensitive context should not be sent to unapproved third-party systems in production.",
  },
  {
    title: "MOCKED Persistent Monitoring Capability Note",
    body: "Persistent monitoring requests require AOI, revisit/cadence expectation, latency requirement, environmental constraints, sensor/payload assumptions, and delivery format before feasibility can be assessed.",
  },
  {
    title: "MOCKED Software Team Interruption Policy",
    body: "Software teams should not be interrupted with vague requests. Requests should first be clarified, classified, prioritised, and routed through an approved owner.",
  },
  {
    title: "MOCKED Customer Commitment Policy",
    body: "AI-generated drafts must not promise capability, delivery dates, feasibility, or pricing without explicit human approval from the relevant owner.",
  },
] as const;

export const architectureSteps = [
  "User",
  "Next.js frontend",
  "/api/analyse",
  "server-side prompt builder",
  "mocked retrieval context",
  "live LLM API",
  "structured JSON parser",
  "Zod schema validation",
  "rule-based eval runner",
  "UI rendering",
  "human approval/audit trail",
] as const;

export const futureArchitectureItems = [
  "SSO/RBAC",
  "audit database",
  "approved model gateway",
  "on-prem/private model option",
  "CRM/ERP/ticketing integrations",
  "internal documentation retrieval",
  "repo/CI/CD integrations",
  "secrets manager",
  "monitoring for cost/latency/failure rate",
  "human review workflow",
  "golden eval dataset",
  "security review",
] as const;
