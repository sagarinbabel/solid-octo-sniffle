import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { mockedContextSnippets } from "@/lib/context";
import { runEvals } from "@/lib/evals";
import { analysisSchema } from "@/lib/schema";

const requestSchema = z.object({
  requestText: z.string().trim().min(8, "Request text is required").max(8000),
});

const SYSTEM_PROMPT = `You are an internal AI workflow analyst for a dual-use deep-tech company. Your job is to turn messy internal requests into structured, auditable work. Do not invent facts. Do not promise feasibility. Flag missing information. Identify sensitive/defence/customer data. Keep humans in the loop. Prefer structured workflow suggestions over autonomous action. Output valid JSON only using the requested schema. The system is for internal triage, not final customer commitments. Use the provided mocked context snippets as guidance, but do not claim they are real company policies.`;

const JSON_SHAPE = `{
  "summary": string,
  "classification": string,
  "sensitivity": string,
  "extracted_fields": {
    "customer_type": string,
    "use_case": string,
    "urgency": string,
    "deadline": string,
    "requested_output": string
  },
  "missing_information": string[],
  "suggested_owners": string[],
  "internal_tasks": string[],
  "draft_internal_spec": string,
  "draft_customer_response": string,
  "risk_notes": string[],
  "audit_notes": string[],
  "recommended_human_approval": boolean,
  "confidence": number
}`;

function buildUserPrompt(requestText: string) {
  const context = mockedContextSnippets
    .map((item) => `MOCKED CONTEXT - ${item.title}: ${item.body}`)
    .join("\n");

  return `Analyse this internal request for triage. Use only the request and mocked context. Mention relevant mocked context titles in audit_notes.

Requested JSON schema:
${JSON_SHAPE}

${context}

Request:
${requestText}`;
}

function extractJson(content: string) {
  const trimmed = content.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Model did not return JSON");
  }
  return match[0];
}

export async function POST(request: Request) {
  const model = process.env.AI_MODEL || "gpt-4.1-mini";
  const timestamp = new Date().toISOString();

  try {
    const body = await request.json();
    const parsedRequest = requestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json(
        { error: "Enter a request with enough detail to analyse." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing server-side API key. Add OPENAI_API_KEY to .env.local." },
        { status: 500 },
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(parsedRequest.data.requestText) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Model returned no content");
    }

    const rawJson = JSON.parse(extractJson(content));
    const result = analysisSchema.parse(rawJson);
    const evalResult = runEvals(parsedRequest.data.requestText, result);

    return NextResponse.json({
      result,
      evalResult,
      model,
      timestamp,
    });
  } catch (error) {
    console.error("Analyse route failed", {
      message: error instanceof Error ? error.message : "Unknown error",
      model,
      timestamp,
    });

    return NextResponse.json(
      { error: "Analysis failed safely. Check the server logs and try again." },
      { status: 500 },
    );
  }
}
