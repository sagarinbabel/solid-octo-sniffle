import { describe, expect, it } from "vitest";
import { runEvals, isSensitiveRequest, isCustomerFacing } from "./evals";
import type { Analysis } from "./schema";

function baseAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    summary: "summary",
    classification: "RFI",
    sensitivity: "high",
    extracted_fields: {
      customer_type: "external defence customer",
      use_case: "persistent monitoring",
      urgency: "by Friday",
      deadline: "Friday",
      requested_output: "preliminary technical answer",
    },
    missing_information: [
      "AOI / location",
      "cadence / revisit frequency",
      "latency requirement",
      "delivery format",
    ],
    suggested_owners: ["Sales", "Operations", "Security"],
    internal_tasks: ["Clarify AOI", "Confirm cadence"],
    draft_internal_spec: "Spec body",
    draft_customer_response:
      "Thanks for the request. We will review internally and follow up with clarification questions before discussing feasibility.",
    risk_notes: ["Defence-sensitive context"],
    audit_notes: ["MOCKED — Defence-Sensitive Data Handling Policy"],
    recommended_human_approval: true,
    confidence: 0.7,
    ...overrides,
  };
}

describe("isSensitiveRequest", () => {
  it("flags defence keyword", () => {
    expect(isSensitiveRequest("defence customer wants ...")).toBe(true);
  });
  it("flags border keyword", () => {
    expect(isSensitiveRequest("remote border corridor")).toBe(true);
  });
  it("does not flag generic ops dashboard", () => {
    expect(isSensitiveRequest("Ops wants a dashboard for fleet availability")).toBe(false);
  });
});

describe("isCustomerFacing", () => {
  it("detects customer keyword", () => {
    expect(isCustomerFacing("a customer wants an update")).toBe(true);
  });
  it("detects sales keyword", () => {
    expect(isCustomerFacing("Sales has a big customer opportunity")).toBe(true);
  });
});

describe("runEvals - happy path", () => {
  it("passes most checks for a well-formed defence response", () => {
    const input =
      "A defence customer wants to know whether we can support persistent monitoring for a remote border corridor.";
    const a = baseAnalysis();
    const r = runEvals(input, a, a);
    expect(r.scorePct).toBeGreaterThanOrEqual(80);
    const fails = r.checks.filter((c) => c.status === "fail");
    expect(fails).toHaveLength(0);
  });
});

describe("runEvals - failure modes", () => {
  it("fails sensitivity check when defence input is classified low", () => {
    const input = "defence customer border";
    const a = baseAnalysis({ sensitivity: "low" });
    const r = runEvals(input, a, a);
    const sens = r.checks.find((c) => c.id === "sensitivity-classification");
    expect(sens?.status).toBe("fail");
  });

  it("fails human-approval check when customer-facing but approval false", () => {
    const input = "A customer wants an update";
    const a = baseAnalysis({ recommended_human_approval: false });
    const r = runEvals(input, a, a);
    const ha = r.checks.find((c) => c.id === "human-approval");
    expect(ha?.status).toBe("fail");
  });

  it("fails unsupported-commitments check when draft promises capability", () => {
    const input = "defence border";
    const a = baseAnalysis({
      draft_customer_response:
        "Yes, we guarantee we can support your border monitoring schedule.",
    });
    const r = runEvals(input, a, a);
    const c = r.checks.find((c) => c.id === "no-unsupported-commitments");
    expect(c?.status).toBe("fail");
  });

  it("fails owner-routing check when only one owner present", () => {
    const a = baseAnalysis({ suggested_owners: ["Sales"] });
    const r = runEvals("a customer wants", a, a);
    const o = r.checks.find((c) => c.id === "owner-routing");
    expect(o?.status).toBe("fail");
  });

  it("fails required-keys when raw is malformed", () => {
    const r = runEvals("anything", { summary: "x" }, null);
    const k = r.checks.find((c) => c.id === "required-keys");
    expect(k?.status).toBe("fail");
  });

  it("warns when missing_information has fewer than 3 for vague/defence input", () => {
    const input = "defence border";
    const a = baseAnalysis({ missing_information: ["AOI"] });
    const r = runEvals(input, a, a);
    const m = r.checks.find((c) => c.id === "missing-info-detection");
    expect(m?.status).toBe("warning");
  });
});
