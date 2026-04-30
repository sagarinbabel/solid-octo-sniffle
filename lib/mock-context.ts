export interface MockContextSnippet {
  id: string;
  title: string;
  body: string;
}

/** Hardcoded MOCKED snippets — not real Kelluu policies or data */
export const MOCK_CONTEXT_SNIPPETS: MockContextSnippet[] = [
  {
    id: "sales-rfi",
    title: "Sales RFI Intake Checklist (MOCKED)",
    body:
      "Every customer-facing request should include customer type, use case, geography/AOI, deadline, requested output, delivery format, and decision owner.",
  },
  {
    id: "defence-handling",
    title: "Defence-Sensitive Data Handling Policy (MOCKED)",
    body:
      "Defence-sensitive or government-related requests require human approval before any customer-facing commitment. Sensitive context should not be sent to unapproved third-party systems in production.",
  },
  {
    id: "persistent-monitoring",
    title: "Persistent Monitoring Capability Note (MOCKED)",
    body:
      "Persistent monitoring requests require AOI, revisit/cadence expectation, latency requirement, environmental constraints, sensor/payload assumptions, and delivery format before feasibility can be assessed.",
  },
  {
    id: "software-interruption",
    title: "Software Team Interruption Policy (MOCKED)",
    body:
      "Software teams should not be interrupted with vague requests. Requests should first be clarified, classified, prioritised, and routed through an approved owner.",
  },
  {
    id: "customer-commitment",
    title: "Customer Commitment Policy (MOCKED)",
    body:
      "AI-generated drafts must not promise capability, delivery dates, feasibility, or pricing without explicit human approval from the relevant owner.",
  },
];

export function formatMockContextForPrompt(): string {
  return MOCK_CONTEXT_SNIPPETS.map(
    (s) => `### ${s.title}\n${s.body}`
  ).join("\n\n");
}
