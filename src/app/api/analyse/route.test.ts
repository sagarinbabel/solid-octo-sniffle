import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { POST } from "./route";

const openAiConstructor = vi.hoisted(() => vi.fn());

vi.mock("openai", () => ({
  default: openAiConstructor,
}));

describe("POST /api/analyse", () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.AI_MODEL;
  const originalNodeEnv = process.env.NODE_ENV;
  const envLocalPath = join(process.cwd(), ".env.local");
  const originalEnvLocal = existsSync(envLocalPath) ? readFileSync(envLocalPath, "utf8") : null;

  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    if (existsSync(envLocalPath)) {
      unlinkSync(envLocalPath);
    }
  });

  afterEach(() => {
    openAiConstructor.mockReset();
    if (originalEnvLocal === null) {
      if (existsSync(envLocalPath)) {
        unlinkSync(envLocalPath);
      }
    } else {
      writeFileSync(envLocalPath, originalEnvLocal);
    }
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
    vi.unstubAllEnvs();
    if (originalNodeEnv) {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it("ignores shell OPENAI_API_KEY and requires .env.local", async () => {
    process.env.OPENAI_API_KEY = "shell-key-should-not-be-used";

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
        "OpenAI API key is missing from .env.local. This prototype intentionally ignores shell environment keys. Create .env.local from .env.example, add OPENAI_API_KEY, then restart npm run dev.",
    });
    expect(openAiConstructor).not.toHaveBeenCalled();
  });

  it("validates model JSON and returns safety checks for the server-side LLM flow", async () => {
    process.env.OPENAI_API_KEY = "shell-key-should-not-be-used";
    process.env.AI_MODEL = "test-model";
    writeFileSync(envLocalPath, "OPENAI_API_KEY=test-local-file-key\nAI_MODEL=gpt-4.1-mini\n");
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
    expect(JSON.stringify(payload)).not.toContain("test-local-file-key");
    expect(openAiConstructor).toHaveBeenCalledWith({ apiKey: "test-local-file-key" });
  });

  it("uses server environment variables in production for hosted deployment", async () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.OPENAI_API_KEY = "production-host-key";
    process.env.AI_MODEL = "production-model";
    openAiConstructor.mockImplementation(function OpenAI() {
      return {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      clean_title: "Ops dashboard request needs discovery",
                      summary: "Ops wants an automated dashboard and needs source-system and permission discovery.",
                      request_type: "Internal ops workflow",
                      urgency: "Medium",
                      business_value: "Medium",
                      technical_complexity: "High",
                      sensitivity: "Unknown",
                      missing_information: ["Data sources", "Permissions", "Update cadence"],
                      suggested_route: "Operations + Product + Software discovery",
                      suggested_next_action: "Approve discovery before implementation.",
                      software_interrupt_allowed: false,
                      draft_clarification_to_sales: "Please confirm source systems, owners, permissions, and update cadence.",
                      risk_flags: ["Integration risk", "Permission review required"],
                      recommended_status: "Approve discovery",
                      audit_notes: ["Referenced MOCKED Software Team Interruption Policy."],
                      confidence: 0.78,
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
            "Customer/opportunity: Internal Operations. Request summary: Ops wants a dashboard connected to internal systems. Deadline: Unknown. Need from Software/Ops: discovery.",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.model).toBe("production-model");
    expect(JSON.stringify(payload)).not.toContain("production-host-key");
    expect(openAiConstructor).toHaveBeenCalledWith({ apiKey: "production-host-key" });
  });
});
