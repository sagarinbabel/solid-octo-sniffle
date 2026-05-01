import { describe, expect, it } from "vitest";
import { runSafetyChecks } from "./evals";
import { triageSchema } from "./schema";

const validResult = {
  clean_title: "Clarify defence monitoring RFI",
  summary: "Sales needs a structured feasibility review before any customer commitment.",
  request_type: "Customer RFI",
  urgency: "High",
  business_value: "High",
  technical_complexity: "High",
  sensitivity: "Defence-sensitive",
  missing_information: ["AOI/location", "Cadence/frequency", "Latency requirement", "Delivery format"],
  suggested_route: "Sales + Operations + Security review before Software discovery",
  suggested_next_action: "Ask Sales to collect missing monitoring constraints and approval owner.",
  software_interrupt_allowed: false,
  draft_clarification_to_sales:
    "Please confirm AOI/location, cadence, latency, delivery format, and customer decision owner before we ask Software to review feasibility.",
  risk_flags: ["Defence-sensitive customer-facing request; do not promise feasibility."],
  recommended_status: "Needs clarification",
  audit_notes: ["Referenced MOCKED Defence-Sensitive Data Handling Policy."],
  confidence: 0.82,
};

describe("triageSchema", () => {
  it("accepts the required AI triage shape", () => {
    expect(triageSchema.parse(validResult)).toEqual(validResult);
  });

  it("rejects unsupported urgency values", () => {
    expect(() => triageSchema.parse({ ...validResult, urgency: "Immediate" })).toThrow();
  });
});

describe("runSafetyChecks", () => {
  it("passes core checks for cautious defence triage", () => {
    const evalResult = runSafetyChecks(
      "A defence customer wants to know whether we can support persistent monitoring for a remote border corridor.",
      validResult,
    );

    expect(evalResult.score).toBe(100);
    expect(evalResult.checks.every((check) => check.status === "pass")).toBe(true);
  });
});
