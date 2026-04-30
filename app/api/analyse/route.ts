import { NextResponse } from "next/server";
import OpenAI from "openai";
import { analysisResultSchema } from "@/lib/schema";
import { formatMockContextForPrompt } from "@/lib/mock-context";
import { runEvals } from "@/lib/evals";
import { z } from "zod";

const bodySchema = z.object({
  requestText: z.string().min(1, "Request text is required").max(20000),
});

const SYSTEM_PROMPT = `You are an internal AI workflow analyst for a dual-use deep-tech company. Your job is to turn messy internal requests into structured, auditable work. Do not invent facts. Do not promise feasibility. Flag missing information. Identify sensitive/defence/customer data. Keep humans in the loop. Prefer structured workflow suggestions over autonomous action. Output valid JSON only using the requested schema. The system is for internal triage, not final customer commitments. Use the provided mocked context snippets as guidance, but do not claim they are real company policies.

You MUST respond with a single JSON object (no markdown, no code fences) with exactly these keys and types:
- summary: string
- classification: string
- sensitivity: string (e.g. low, medium, high — use appropriately for defence/government/customer data)
- extracted_fields: object with customer_type, use_case, urgency, deadline, requested_output (all strings; use "unknown" or "not stated" if missing)
- missing_information: array of strings
- suggested_owners: array of strings (draw from: Sales, Operations, Software, Security, Compliance, Product, Delivery)
- internal_tasks: array of strings
- draft_internal_spec: string
- draft_customer_response: string (cautious, no capability or delivery promises; internal review only)
- risk_notes: array of strings
- audit_notes: array of strings — MUST mention which mocked context titles (by their MOCKED titles) informed the analysis
- recommended_human_approval: boolean
- confidence: number between 0 and 1

Use snake_case for extracted_fields property names exactly as: customer_type, use_case, urgency, deadline, requested_output.`;

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Could not parse JSON from model output");
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL?.trim() || "gpt-4.1-mini";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing server-side API key. Add OPENAI_API_KEY to .env.local." },
      { status: 400 }
    );
  }

  let jsonBody: unknown;
  try {
    jsonBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedBody = bodySchema.safeParse(jsonBody);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid input: requestText is required." },
      { status: 400 }
    );
  }

  const { requestText } = parsedBody.data;
  const mockContext = formatMockContextForPrompt();
  const userContent = `## Mocked internal context (not real policies — for triage guidance only)\n\n${mockContext}\n\n## Incoming request (internal triage)\n\n${requestText}`;

  const timestamp = new Date().toISOString();

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      console.error("[analyse] Empty model content");
      return NextResponse.json(
        { error: "The model returned no content. Try again." },
        { status: 502 }
      );
    }

    let data: unknown;
    try {
      data = extractJsonObject(raw);
    } catch (e) {
      console.error("[analyse] JSON parse failed", e);
      return NextResponse.json(
        { error: "Could not parse structured output from the model." },
        { status: 502 }
      );
    }

    const validated = analysisResultSchema.safeParse(data);
    if (!validated.success) {
      console.error("[analyse] Zod validation failed", validated.error.flatten());
      return NextResponse.json(
        { error: "Model output failed schema validation." },
        { status: 502 }
      );
    }

    const result = validated.data;
    const evalResult = runEvals(requestText, result);

    return NextResponse.json({
      result,
      evalResult,
      model,
      timestamp,
    });
  } catch (err) {
    console.error("[analyse] OpenAI or server error", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again later." },
      { status: 500 }
    );
  }
}
