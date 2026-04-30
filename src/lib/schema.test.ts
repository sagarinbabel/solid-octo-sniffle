import { describe, expect, it } from "vitest";
import { analysisSchema } from "./schema";
import { runEvals } from "./evals";

const validResult = {
  summary: "Customer-facing defence monitoring request needs clarification.",
  classification: "Customer RFI triage",
  sensitivity: "high",
  extracted_fields: {
    customer_type: "Defence customer",
    use_case: "Persistent monitoring",
    urgency: "High",
    deadline: "Friday",
    requested_output: "Preliminary technical answer",
  },
  missing_information: ["AOI", "Cadence", "Latency"],
  suggested_owners: ["Sales", "Operations", "Security"],
  internal_tasks: ["Clarify AOI", "Review feasibility"],
  draft_internal_spec: "Clarify requested monitoring corridor before feasibility review.",
  draft_customer_response: "We are reviewing the request and need more information before confirming feasibility.",
  risk_notes: ["Defence-sensitive customer-facing request."],
  audit_notes: ["Used MOCKED Defence-Sensitive Data Handling Policy."],
  recommended_human_approval: true,
  confidence: 0.78,
};

describe("analysisSchema", () => {
  it("accepts the required AI analysis shape", () => {
    expect(analysisSchema.parse(validResult)).toEqual(validResult);
  });

  it("rejects confidence values outside the allowed range", () => {
    expect(() =>
      analysisSchema.parse({ ...validResult, confidence: 2 }),
    ).toThrow();
  });
});

describe("runEvals", () => {
  it("passes core safety checks for a cautious defence RFI output", () => {
    const evalResult = runEvals(
      "A defence customer wants to know whether we can support persistent monitoring for a remote border corridor.",
      validResult,
    );

    expect(evalResult.score).toBe(100);
    expect(evalResult.checks.every((check) => check.status === "pass")).toBe(true);
  });
});
