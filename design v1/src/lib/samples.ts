import type { TriageResult } from "./schema";

export type SampleRequest = {
  id: string;
  label: string;
  customerName: string;
  requestSummary: string;
  deadline: string;
  softwareNeed: string;
  commitmentNeeded: "Yes" | "No";
  sensitivity: "Normal" | "Customer confidential" | "Defence-sensitive" | "Unknown";
};

export const sampleRequests: SampleRequest[] = [
  {
    id: "defence-rfi",
    label: "Defence border-monitoring RFI",
    customerName: "Defence border monitoring opportunity",
    requestSummary:
      "A defence customer wants to know whether we can support persistent monitoring for a remote border corridor. They need a preliminary technical answer by Friday and want to understand coverage, latency, winter performance, and delivery format.",
    deadline: "Friday",
    softwareNeed: "Help Sales understand whether this is ready for software/ops review and what information is missing.",
    commitmentNeeded: "Yes",
    sensitivity: "Defence-sensitive",
  },
  {
    id: "vague-sales",
    label: "Vague sales request",
    customerName: "Large customer meeting",
    requestSummary:
      "Sales has a big customer opportunity next month. They need something impressive for the meeting and want software to quickly prepare a demo.",
    deadline: "Next month",
    softwareNeed: "Prepare a demo concept or decide what Sales must clarify first.",
    commitmentNeeded: "No",
    sensitivity: "Customer confidential",
  },
  {
    id: "delivery-update",
    label: "Customer delivery update",
    customerName: "Monitoring report customer",
    requestSummary: "A customer wants an update on when their latest monitoring report will be ready. Can we send them something today?",
    deadline: "Today",
    softwareNeed: "Check if this needs Delivery/Ops input or a customer-safe status draft.",
    commitmentNeeded: "Yes",
    sensitivity: "Customer confidential",
  },
  {
    id: "unsafe-promise",
    label: "Unsafe promise request",
    customerName: "Border monitoring schedule request",
    requestSummary: "Can the agent just email the customer and promise that we can support their requested border monitoring schedule?",
    deadline: "As soon as possible",
    softwareNeed: "Decide whether any direct customer promise is allowed.",
    commitmentNeeded: "Yes",
    sensitivity: "Defence-sensitive",
  },
  {
    id: "ops-dashboard",
    label: "Internal ops dashboard request",
    customerName: "Internal Operations",
    requestSummary:
      "Ops wants a dashboard showing fleet availability, recent mission status, delayed jobs, and customer delivery risks. They want it connected to internal systems and updated automatically.",
    deadline: "Not specified",
    softwareNeed: "Assess routing, missing data sources, permissions, and whether discovery should start.",
    commitmentNeeded: "No",
    sensitivity: "Unknown",
  },
];

export const seededQueueItem: TriageResult = {
  clean_title: "Clarify defence monitoring RFI before software review",
  summary:
    "Sales needs a preliminary answer for a defence customer asking about persistent border monitoring, but key feasibility inputs are missing.",
  request_type: "Customer RFI / feasibility triage",
  urgency: "High",
  business_value: "High",
  technical_complexity: "High",
  sensitivity: "Defence-sensitive",
  missing_information: ["Exact AOI/location", "Expected revisit cadence", "Latency requirement", "Delivery format", "Winter operating assumptions"],
  suggested_route: "Sales + Operations + Security discovery before Software interruption",
  suggested_next_action: "Ask Sales to collect missing feasibility inputs and assign Operations/Security review before routing to Software.",
  software_interrupt_allowed: false,
  draft_clarification_to_sales:
    "Before Software reviews this, please confirm the AOI, cadence, latency expectation, delivery format, decision owner, and whether any customer-facing commitment is expected.",
  risk_flags: ["Defence-sensitive request", "Customer-facing commitment risk", "Feasibility cannot be confirmed from current information"],
  recommended_status: "Needs Sales clarification",
  audit_notes: [
    "Seeded mocked queue item",
    "Referenced MOCKED Sales RFI Intake Checklist",
    "Referenced MOCKED Defence-Sensitive Data Handling Policy",
    "No external action taken",
  ],
  confidence: 0.86,
};
