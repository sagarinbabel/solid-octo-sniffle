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
          requestText: "A defence customer needs cautious request triage before any customer commitment.",
        }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error:
        "OpenAI API key is missing. Create .env.local from .env.example, add OPENAI_API_KEY, then restart npm run dev.",
    });
    expect(openAiConstructor).not.toHaveBeenCalled();
  });

  it("validates model JSON and returns safety checks for the server-side LLM flow", async () => {
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
                      clean_title: "Defence border monitoring RFI needs clarification",
                      summary: "Sales needs a structured response for a defence monitoring request before feasibility is discussed.",
                      request_type: "Customer RFI",
                      urgency: "High",
                      business_value: "High",
                      technical_complexity: "High",
                      sensitivity: "Defence-sensitive",
                      missing_information: ["AOI/location", "Cadence/frequency", "Latency requirement", "Delivery format"],
                      suggested_route: "Sales + Security + Operations discovery review before Software",
                      suggested_next_action: "Ask Sales to collect missing feasibility inputs and assign Security review.",
                      software_interrupt_allowed: false,
                      draft_clarification_to_sales:
                        "Please confirm AOI, monitoring cadence, latency expectations, delivery format, and decision owner before Software review.",
                      risk_flags: ["Defence-sensitive customer-facing request", "Feasibility must not be promised"],
                      recommended_status: "Needs Sales clarification",
                      audit_notes: ["Referenced MOCKED Defence-Sensitive Data Handling Policy."],
                      confidence: 0.84,
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
            "Customer/opportunity: Border programme. Request summary: A defence customer wants to know whether we can support persistent monitoring for a remote border corridor. Deadline: Friday. Need from Software/Ops: feasibility input. Customer-facing commitment needed: yes. Sensitivity: Defence-sensitive.",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.model).toBe("test-model");
    expect(payload.result.software_interrupt_allowed).toBe(false);
    expect(payload.result.sensitivity).toBe("Defence-sensitive");
    expect(payload.safetyResult.score).toBe(100);
    expect(JSON.stringify(payload)).not.toContain("test-server-key");
  });
});
