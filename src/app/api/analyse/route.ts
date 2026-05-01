import OpenAI from "openai";
import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { mockedContextSnippets } from "@/lib/context";
import { runSafetyChecks } from "@/lib/evals";
import { triageSchema } from "@/lib/schema";

export const runtime = "nodejs";

const requestSchema = z.object({
  requestText: z.string().trim().min(8, "Request text is required").max(8000),
});

const missingLocalKeyError =
  "OpenAI API key is missing from .env.local. This prototype intentionally ignores shell environment keys. Create .env.local from .env.example, add OPENAI_API_KEY, then restart npm run dev.";

const SYSTEM_PROMPT = `You are an internal AI request triage assistant for a dual-use deep-tech company. Your job is to protect software and operations teams from vague requests while helping Sales get useful answers faster. Turn messy customer/internal requests into structured, reviewable work. Do not promise feasibility. Do not allow direct software interruption unless the request is clear, urgent, and sufficiently specified. Flag missing information. Flag defence/customer-sensitive topics. Prefer asking for clarification before routing vague work to Software. Output valid JSON only.`;

const JSON_SHAPE = `{
  "clean_title": string,
  "summary": string,
  "request_type": string,
  "urgency": "Low" | "Medium" | "High" | "Unknown",
  "business_value": "Low" | "Medium" | "High" | "Unknown",
  "technical_complexity": "Low" | "Medium" | "High" | "Unknown",
  "sensitivity": "Normal" | "Customer confidential" | "Defence-sensitive" | "Unknown",
  "missing_information": string[],
  "suggested_route": string,
  "suggested_next_action": string,
  "software_interrupt_allowed": boolean,
  "draft_clarification_to_sales": string,
  "risk_flags": string[],
  "recommended_status": string,
  "audit_notes": string[],
  "confidence": number
}`;

function buildUserPrompt(requestText: string) {
  const context = mockedContextSnippets
    .map((item) => `MOCKED CONTEXT - ${item.title}: ${item.body}`)
    .join("\n");

  return `Triage this Sales/customer/internal request for Head of Software review.

Use only the submitted request and mocked context. Mention relevant mocked context titles in audit_notes. Do not claim the mocked context is a real company policy.

Requested JSON schema:
${JSON_SHAPE}

${context}

Submitted request:
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

function readLocalOpenAiKey() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return "";
  }

  const envFile = readFileSync(envPath, "utf8");
  const match = envFile.match(/^OPENAI_API_KEY=(.*)$/m);
  const rawValue = match?.[1]?.trim() ?? "";
  return rawValue.replace(/^['"]|['"]$/g, "");
}

export async function POST(request: Request) {
  const model = process.env.AI_MODEL || "gpt-4.1-mini";
  const timestamp = new Date().toISOString();

  try {
    const body = await request.json();
    const parsedRequest = requestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json(
        { error: "Enter a request with enough detail to triage." },
        { status: 400 },
      );
    }

    const openAiApiKey = readLocalOpenAiKey();
    if (!openAiApiKey) {
      return NextResponse.json(
        { error: missingLocalKeyError },
        { status: 500 },
      );
    }

    const openai = new OpenAI({ apiKey: openAiApiKey });

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
    const result = triageSchema.parse(rawJson);
    const safetyResult = runSafetyChecks(parsedRequest.data.requestText, result);

    return NextResponse.json({
      result,
      safetyResult,
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
      { error: "Triage failed safely. Check the server logs and try again." },
      { status: 500 },
    );
  }
}
