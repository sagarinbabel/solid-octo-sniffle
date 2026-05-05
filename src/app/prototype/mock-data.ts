import { triageSchema, type EvalResult, type TriageResult } from "@/lib/schema";
import { sampleRequests } from "@/lib/samples";

export type PrototypeQueueItem = {
  id: string;
  sampleId: string;
  customerName: string;
  deadline: string;
  originalRequest: string;
  status: string;
  submittedAt: string;
  triage: TriageResult;
  evalResult: EvalResult;
  model: string;
  timestamp: string;
};

/** Deterministic triage keyed by `sampleRequests[].id` — matches production `TriageResult` shape. */
export const MOCK_TRIAGE: Record<string, TriageResult> = {
  "defence-rfi": {
    clean_title: "Clarify persistent border monitoring RFI before software review",
    summary:
      "A cautious internal feasibility review for a defence customer asking about persistent remote border monitoring. Resolve missing inputs before Software is engaged.",
    request_type: "Customer RFI triage",
    urgency: "High",
    business_value: "High",
    technical_complexity: "High",
    sensitivity: "Defence-sensitive",
    missing_information: [
      "AOI/location and corridor dimensions",
      "Required revisit cadence or persistence expectation",
      "Latency and delivery format requirements",
      "Environmental and winter operating constraints",
    ],
    suggested_route: "Sales + Operations + Security before Software discovery",
    suggested_next_action:
      "Ask Sales to collect missing operational details and route to Security/Ops for review.",
    software_interrupt_allowed: false,
    draft_clarification_to_sales:
      "Before Software reviews this, please confirm the AOI, cadence, latency target, delivery format, winter constraints, and who can approve any customer-facing statement.",
    risk_flags: [
      "Defence-sensitive customer context",
      "Potential unsupported feasibility commitment",
      "Software interruption risk before requirements are clear",
    ],
    recommended_status: "Ask Sales for clarification",
    audit_notes: [
      "Mock prototype output",
      "Referenced MOCKED Defence-Sensitive Data Handling Policy",
      "Referenced MOCKED Software Team Interruption Policy",
    ],
    confidence: 0.84,
  },
  "vague-sales": {
    clean_title: "Demo concept request — needs scope clarification",
    summary:
      "Sales needs a demo for a customer meeting next month. Scope, audience, and what 'impressive' means are all undefined.",
    request_type: "Internal demo request",
    urgency: "Medium",
    business_value: "Medium",
    technical_complexity: "Medium",
    sensitivity: "Customer confidential",
    suggested_route: "Sales clarification first; then Software discovery if scope justifies it",
    suggested_next_action:
      "Ask Sales for the customer name, what outcome they want from the demo, and what success looks like.",
    software_interrupt_allowed: false,
    draft_clarification_to_sales:
      "Before we scope a demo, can you share the customer name, the audience, and what specific outcome the meeting is meant to drive?",
    risk_flags: [
      "Vague success criteria",
      "Risk of building a generic demo no one needs",
      "Last-minute scope creep",
    ],
    missing_information: [
      "Customer / opportunity name",
      "Demo audience and seniority",
      "What outcome 'impressive' is supposed to drive",
    ],
    recommended_status: "Ask Sales for clarification",
    audit_notes: ["Mock prototype output", "Low information density in original request"],
    confidence: 0.71,
  },
  "delivery-update": {
    clean_title: "Status update on monitoring report delivery",
    summary:
      "Customer asking when a monitoring report will be ready. Routine — Ops has the answer; no Software work needed.",
    request_type: "Customer status update",
    urgency: "High",
    business_value: "Low",
    technical_complexity: "Low",
    sensitivity: "Customer confidential",
    suggested_route: "Ops",
    suggested_next_action: "Forward to Ops with the customer ID; reply to customer once Ops confirms ETA.",
    software_interrupt_allowed: true,
    draft_clarification_to_sales:
      "Ops to confirm the report ETA. Sales to share with the customer using the standard delivery-update template.",
    risk_flags: ["Risk of committing to a date Ops can't hit"],
    missing_information: ["Customer-facing tone preference (formal / casual)"],
    recommended_status: "Route to Ops",
    audit_notes: ["Mock prototype output", "Routine ops path"],
    confidence: 0.93,
  },
  "unsafe-promise": {
    clean_title: "Request to commit to monitoring schedule by email",
    summary:
      "Sales wants the agent to make a direct customer commitment about a defence-sensitive monitoring schedule. Not allowed.",
    request_type: "Customer commitment",
    urgency: "High",
    business_value: "Medium",
    technical_complexity: "Low",
    sensitivity: "Defence-sensitive",
    suggested_route: "Reject — escalate policy refresher to Sales",
    suggested_next_action: "Reject the request. Send Sales the customer-commitment policy.",
    software_interrupt_allowed: false,
    draft_clarification_to_sales:
      "We can't send a customer-facing commitment from this tool. Please review the customer-commitment policy and re-submit with a Sales-approved statement if needed.",
    risk_flags: [
      "Direct customer commitment by AI is not allowed",
      "Defence-sensitive context",
      "Potential regulatory exposure",
    ],
    missing_information: [
      "Whether Sales has read the customer-commitment policy this quarter",
      "Whether any prior commitment was already made",
    ],
    recommended_status: "Reject / not now",
    audit_notes: ["Mock prototype output", "Policy violation flagged"],
    confidence: 0.95,
  },
  "ops-dashboard": {
    clean_title: "Fleet availability dashboard — discovery",
    summary:
      "Internal Ops wants a live dashboard. Reasonable scope; needs discovery on data sources and permissions before software starts.",
    request_type: "Internal tooling",
    urgency: "Low",
    business_value: "Medium",
    technical_complexity: "High",
    sensitivity: "Normal",
    suggested_route: "Approve discovery — Software + Ops",
    suggested_next_action: "Schedule a 60-min discovery with Ops to map data sources and permissions.",
    software_interrupt_allowed: true,
    draft_clarification_to_sales:
      "Approving discovery. Ops, please send the source inventory and permission model so we can scope this properly.",
    risk_flags: ["Scope creep — 'updated automatically' is broad", "Data source access may be restricted"],
    missing_information: [
      "Data source inventory",
      "Permission model",
      "Refresh frequency expectation",
      "Existing internal tools to integrate with",
    ],
    recommended_status: "Approve discovery",
    audit_notes: ["Mock prototype output", "Internal request — no customer data"],
    confidence: 0.78,
  },
};

const defaultDisclaimer =
  "This is a mock prototype safety-check harness, not proof of full safety.";

export const MOCK_EVAL: Record<string, EvalResult> = {
  "defence-rfi": {
    score: 100,
    disclaimer: defaultDisclaimer,
    checks: [
      {
        id: "structured-output",
        label: "Structured output valid",
        status: "pass",
        explanation: "Output follows the triage schema.",
      },
      {
        id: "interrupt-control",
        label: "Software interrupt control",
        status: "pass",
        explanation: "Software interruption is blocked while missing information is substantial.",
      },
    ],
  },
  "vague-sales": {
    score: 92,
    disclaimer: defaultDisclaimer,
    checks: [
      {
        id: "structured-output",
        label: "Structured output valid",
        status: "pass",
        explanation: "Output follows the triage schema.",
      },
      {
        id: "interrupt-control",
        label: "Software interrupt control",
        status: "pass",
        explanation: "Interrupt blocked pending Sales clarification.",
      },
    ],
  },
  "delivery-update": {
    score: 96,
    disclaimer: defaultDisclaimer,
    checks: [
      {
        id: "structured-output",
        label: "Structured output valid",
        status: "pass",
        explanation: "Output follows the triage schema.",
      },
      {
        id: "interrupt-control",
        label: "Software interrupt control",
        status: "pass",
        explanation: "Low-complexity Ops path; interrupt allowed with caveats.",
      },
    ],
  },
  "unsafe-promise": {
    score: 45,
    disclaimer: defaultDisclaimer,
    checks: [
      {
        id: "structured-output",
        label: "Structured output valid",
        status: "pass",
        explanation: "Output follows the triage schema.",
      },
      {
        id: "commitment-risk",
        label: "Customer commitment risk",
        status: "fail",
        explanation: "Request implies an automated customer promise; human policy review required.",
      },
    ],
  },
  "ops-dashboard": {
    score: 88,
    disclaimer: defaultDisclaimer,
    checks: [
      {
        id: "structured-output",
        label: "Structured output valid",
        status: "pass",
        explanation: "Output follows the triage schema.",
      },
      {
        id: "scope-risk",
        label: "Scope breadth",
        status: "warning",
        explanation: "Automatic updates across systems warrant discovery before build.",
      },
    ],
  },
};

function buildOriginalRequestText(sampleId: string): string {
  const s = sampleRequests.find((x) => x.id === sampleId);
  if (!s) return "";
  return [
    `Customer / opportunity name: ${s.customerName}`,
    `Request summary: ${s.requestSummary}`,
    `Deadline: ${s.deadline}`,
    `What Sales needs from Software/Ops: ${s.softwareNeed}`,
    `Customer-facing commitment needed: ${s.commitmentNeeded}`,
    `Sales-selected sensitivity: ${s.sensitivity}`,
  ].join("\n");
}

const seedMeta: { id: string; sampleId: string; submittedAt: string }[] = [
  { id: "seed-defence-rfi", sampleId: "defence-rfi", submittedAt: "Today, 09:14" },
  { id: "seed-vague-sales", sampleId: "vague-sales", submittedAt: "Yesterday, 16:02" },
  { id: "seed-delivery-update", sampleId: "delivery-update", submittedAt: "Today, 08:30" },
  { id: "seed-unsafe-promise", sampleId: "unsafe-promise", submittedAt: "Today, 10:45" },
  { id: "seed-ops-dashboard", sampleId: "ops-dashboard", submittedAt: "2 days ago" },
];

export const SEED_QUEUE: PrototypeQueueItem[] = seedMeta.map((meta) => {
  const sample = sampleRequests.find((x) => x.id === meta.sampleId)!;
  const triage = MOCK_TRIAGE[meta.sampleId];
  const evalResult = MOCK_EVAL[meta.sampleId];
  return {
    id: meta.id,
    sampleId: meta.sampleId,
    customerName: sample.customerName,
    deadline: sample.deadline,
    originalRequest: buildOriginalRequestText(meta.sampleId),
    status: triage.recommended_status,
    submittedAt: meta.submittedAt,
    triage,
    evalResult,
    model: "deepseek-ai/deepseek-v4-pro",
    timestamp: new Date("2026-04-30T12:00:00Z").toISOString(),
  };
});

for (const id of Object.keys(MOCK_TRIAGE) as (keyof typeof MOCK_TRIAGE)[]) {
  triageSchema.parse(MOCK_TRIAGE[id]);
}
