import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { AnalysisSchema } from "@/lib/schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import { runEvals } from "@/lib/evals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestBodySchema = z.object({
  requestText: z.string().min(1).max(10000),
});

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

function extractFirstJsonObject(text: string): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return trimmed;
  // Try to strip code fences
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  // Fallback: first { ... last }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return null;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = RequestBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body: requestText is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing server-side API key. Add OPENAI_API_KEY to .env.local.",
      },
      { status: 500 },
    );
  }

  const requestText = parsed.data.requestText;
  const userPrompt = buildUserPrompt(requestText);
  const timestamp = new Date().toISOString();

  let rawContent = "";
  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });
    rawContent = completion.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    // Server-side log only.
    console.error("[/api/analyse] LLM call failed:", safeErrorMessage(err));
    return NextResponse.json(
      {
        error:
          "Upstream model call failed. Check server logs and your OPENAI_API_KEY / AI_MODEL configuration.",
      },
      { status: 502 },
    );
  }

  const jsonText = extractFirstJsonObject(rawContent);
  let parsedJson: unknown = null;
  if (jsonText) {
    try {
      parsedJson = JSON.parse(jsonText);
    } catch (err) {
      console.error(
        "[/api/analyse] Failed to JSON.parse model output:",
        safeErrorMessage(err),
      );
    }
  }

  const validation = parsedJson
    ? AnalysisSchema.safeParse(parsedJson)
    : null;
  const analysis = validation && validation.success ? validation.data : null;

  const evalResult = runEvals(requestText, parsedJson, analysis);

  if (!analysis) {
    return NextResponse.json(
      {
        error:
          "Model output failed schema validation. The eval suite still ran on the raw output.",
        rawOutputPreview: rawContent.slice(0, 500),
        evalResult,
        model,
        timestamp,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    result: analysis,
    evalResult,
    model,
    timestamp,
  });
}
