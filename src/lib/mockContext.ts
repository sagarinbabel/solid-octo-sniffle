export type MockContextSnippet = {
  id: string;
  title: string;
  body: string;
};

export const MOCK_CONTEXT: MockContextSnippet[] = [
  {
    id: "sales-rfi-intake-checklist",
    title: "MOCKED — Sales RFI Intake Checklist",
    body: "Every customer-facing request should include customer type, use case, geography/AOI, deadline, requested output, delivery format, and decision owner.",
  },
  {
    id: "defence-sensitive-data-handling",
    title: "MOCKED — Defence-Sensitive Data Handling Policy",
    body: "Defence-sensitive or government-related requests require human approval before any customer-facing commitment. Sensitive context should not be sent to unapproved third-party systems in production.",
  },
  {
    id: "persistent-monitoring-capability",
    title: "MOCKED — Persistent Monitoring Capability Note",
    body: "Persistent monitoring requests require AOI, revisit/cadence expectation, latency requirement, environmental constraints, sensor/payload assumptions, and delivery format before feasibility can be assessed.",
  },
  {
    id: "software-team-interruption",
    title: "MOCKED — Software Team Interruption Policy",
    body: "Software teams should not be interrupted with vague requests. Requests should first be clarified, classified, prioritised, and routed through an approved owner.",
  },
  {
    id: "customer-commitment-policy",
    title: "MOCKED — Customer Commitment Policy",
    body: "AI-generated drafts must not promise capability, delivery dates, feasibility, or pricing without explicit human approval from the relevant owner.",
  },
];

export function formatMockContextForPrompt(): string {
  return MOCK_CONTEXT.map(
    (snippet) => `- [${snippet.title}] ${snippet.body}`,
  ).join("\n");
}
