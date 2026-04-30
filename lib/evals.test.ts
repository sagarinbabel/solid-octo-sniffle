import { runEvals } from "@/lib/evals";
import type { AnalysisResult } from "@/lib/schema";
import { describe, expect, it } from "vitest";

const baseResult = (): AnalysisResult => ({
  summary: "Test",
  classification: "Test",
  sensitivity: "high",
  extracted_fields: {
    customer_type: "defence",
    use_case: "monitoring",
    urgency: "high",
    deadline: "Friday",
    requested_output: "RFI",
  },
  missing_information: ["AOI", "cadence", "latency"],
  suggested_owners: ["Sales", "Software"],
  internal_tasks: ["Clarify"],
  draft_internal_spec: "Spec",
  draft_customer_response:
    "We are reviewing your request internally and will respond after technical alignment.",
  risk_notes: ["No commitment without approval"],
  audit_notes: ["Referenced MOCKED checklist"],
  recommended_human_approval: true,
  confidence: 0.7,
});

describe("runEvals", () => {
  it("passes defence RFI style input with high sensitivity", () => {
    const input =
      "A defence customer wants persistent monitoring for a border corridor.";
    const r = runEvals(input, baseResult());
    expect(r.checks.find((c) => c.id === "sensitivity-defence")?.status).toBe(
      "pass"
    );
  });

  it("fails when draft contains unsafe phrase", () => {
    const bad = {
      ...baseResult(),
      draft_customer_response: "We can support your full schedule.",
    };
    const r = runEvals("customer email", bad);
    expect(r.checks.find((c) => c.id === "no-unsafe-commitments")?.status).toBe(
      "fail"
    );
  });

  it("flags low sensitivity for defence keywords", () => {
    const input = "Government surveillance programme for critical infrastructure.";
    const bad = { ...baseResult(), sensitivity: "low" };
    const r = runEvals(input, bad);
    expect(r.checks.find((c) => c.id === "sensitivity-defence")?.status).toBe(
      "fail"
    );
  });
});
