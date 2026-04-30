import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const openAiConstructor = vi.hoisted(() => vi.fn());

vi.mock("openai", () => ({
  default: openAiConstructor,
}));

describe("POST /api/analyse", () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.AI_MODEL;

  afterEach(() => {
    openAiConstructor.mockReset();
    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
    if (originalModel) {
      process.env.AI_MODEL = originalModel;
    } else {
      delete process.env.AI_MODEL;
    }
  });

  it("returns a safe missing-key error without calling OpenAI", async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(
      new Request("http://localhost/api/analyse", {
        method: "POST",
        body: JSON.stringify({
          requestText: "A defence customer needs a cautious internal triage response before any customer commitment.",
        }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Missing server-side API key. Add OPENAI_API_KEY to .env.local.",
    });

    expect(openAiConstructor).not.toHaveBeenCalled();
  });

  it("validates model JSON and returns eval results for the server-side LLM flow", async () => {
    process.env.OPENAI_API_KEY = "test-server-key";
    process.env.AI_MODEL = "test-model";
    openAiConstructor.mockImplementation(function OpenAI() {
      return {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    summary: "Defence RFI needs structured triage before any feasibility statement.",
                    classification: "Customer RFI triage",
                    sensitivity: "high",
                    extracted_fields: {
                      customer_type: "Defence customer",
                      use_case: "Persistent border monitoring",
                      urgency: "High",
                      deadline: "Friday",
                      requested_output: "Preliminary technical answer",
                    },
                    missing_information: ["AOI/location", "Cadence/frequency", "Latency requirement", "Delivery format"],
                    suggested_owners: ["Sales", "Operations", "Security"],
                    internal_tasks: ["Clarify AOI", "Collect cadence and latency requirements"],
                    draft_internal_spec: "Prepare a feasibility review package after clarifying AOI, cadence, latency, and delivery format.",
                    draft_customer_response:
                      "We are reviewing the monitoring request and need additional operational details before confirming feasibility or schedule.",
                    risk_notes: ["Defence-sensitive and customer-facing; avoid capability commitments before review."],
                    audit_notes: ["Referenced MOCKED Defence-Sensitive Data Handling Policy."],
                    recommended_human_approval: true,
                    confidence: 0.82,
                  }),
                },
              },
            ],
          }),
        },
      },
    };
    });

    const response = await POST(
      new Request("http://localhost/api/analyse", {
        method: "POST",
        body: JSON.stringify({
          requestText:
            "A defence customer wants to know whether we can support persistent monitoring for a remote border corridor.",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.model).toBe("test-model");
    expect(payload.result.recommended_human_approval).toBe(true);
    expect(payload.evalResult.score).toBeGreaterThanOrEqual(80);
    expect(JSON.stringify(payload)).not.toContain("test-server-key");
  });
});
