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

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_PRIMARY_MODEL = "meta/llama-3.2-3b-instruct";
const DEFAULT_FALLBACK_MODEL = "meta/llama-3.1-8b-instruct";
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_CACHE_TTL_MS = 60_000;
const DEFAULT_CACHE_MAX_ENTRIES = 100;

const missingLocalKeyError =
  "NVIDIA NIM API key is missing from .env.local. This prototype intentionally ignores shell environment keys. Create .env.local from .env.example, add NVIDIA_API_KEY, then restart npm run dev.";
const missingProductionKeyError =
  "NVIDIA NIM API key is missing from the server environment. Add NVIDIA_API_KEY in your hosting provider's secure environment variable settings and redeploy.";

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
    .map((item) => `MOCKED CONTEXT - ${item.title}: ${item.body.slice(0, 260)}`)
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

function readLocalNvidiaKey() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return "";
  }

  const envFile = readFileSync(envPath, "utf8");
  const match = envFile.match(/^NVIDIA_API_KEY=(.*)$/m);
  const rawValue = match?.[1]?.trim() ?? "";
  return rawValue.replace(/^['"]|['"]$/g, "");
}

function readNvidiaKey() {
  if (process.env.NODE_ENV === "production") {
    return {
      apiKey: process.env.NVIDIA_API_KEY?.trim() ?? "",
      missingKeyError: missingProductionKeyError,
    };
  }

  return {
    apiKey: readLocalNvidiaKey(),
    missingKeyError: missingLocalKeyError,
  };
}

function readEnvInt(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nowMs() {
  const [seconds, nanoseconds] = process.hrtime();
  return seconds * 1000 + nanoseconds / 1_000_000;
}

function stableKeyForRequest(model: string, requestText: string) {
  // Avoid importing crypto: keep this cheap and stable enough for a demo cache.
  const prefix = `${model}::${requestText.length}::`;
  let hash = 2166136261;
  for (let i = 0; i < requestText.length; i++) {
    hash ^= requestText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return prefix + (hash >>> 0).toString(16);
}

type CachedValue = {
  expiresAt: number;
  payload: {
    result: unknown;
    safetyResult: unknown;
    model: string;
    timestamp: string;
    timings?: Record<string, number>;
    cache?: { hit: boolean; ageMs?: number; ttlMs?: number };
  };
};

const cache = new Map<string, CachedValue>();

function cacheGet(key: string, now: number) {
  const existing = cache.get(key);
  if (!existing) return null;
  if (existing.expiresAt <= now) {
    cache.delete(key);
    return null;
  }
  return existing;
}

function cacheSet(key: string, value: CachedValue) {
  cache.set(key, value);
  if (cache.size <= DEFAULT_CACHE_MAX_ENTRIES) return;
  // Drop oldest-ish entry (Map preserves insertion order).
  const firstKey = cache.keys().next().value as string | undefined;
  if (firstKey) cache.delete(firstKey);
}

async function createCompletionWithTimeout({
  openai,
  model,
  messages,
  timeoutMs,
}: {
  openai: OpenAI;
  model: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  timeoutMs: number;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await openai.chat.completions.create(
      {
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        // Keep completions bounded for latency.
        max_tokens: 700,
        messages,
      },
      { signal: controller.signal },
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const primaryModel = process.env.AI_MODEL || DEFAULT_PRIMARY_MODEL;
  const fallbackModel = process.env.AI_MODEL_FALLBACK || DEFAULT_FALLBACK_MODEL;
  const timeoutMs = readEnvInt("AI_TIMEOUT_MS", DEFAULT_TIMEOUT_MS);
  const cacheTtlMs = readEnvInt("AI_CACHE_TTL_MS", DEFAULT_CACHE_TTL_MS);
  const debugTimings = process.env.AI_DEBUG_TIMINGS === "1";
  const timestamp = new Date().toISOString();
  const t0 = nowMs();

  try {
    const body = await request.json();
    const parsedRequest = requestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json(
        { error: "Enter a request with enough detail to triage." },
        { status: 400 },
      );
    }

    const { apiKey: nvidiaApiKey, missingKeyError } = readNvidiaKey();
    if (!nvidiaApiKey) {
      return NextResponse.json(
        { error: missingKeyError },
        { status: 500 },
      );
    }

    const requestText = parsedRequest.data.requestText;
    const cacheKey = stableKeyForRequest(primaryModel, requestText);
    const cacheNow = Date.now();
    const cached = cacheTtlMs > 0 ? cacheGet(cacheKey, cacheNow) : null;
    if (cached) {
      const ageMs = Math.max(0, cacheTtlMs - (cached.expiresAt - cacheNow));
      const payload = {
        ...cached.payload,
        cache: { hit: true, ageMs, ttlMs: cacheTtlMs },
      };
      return NextResponse.json(payload);
    }

    const openai = new OpenAI({
      apiKey: nvidiaApiKey,
      baseURL: NIM_BASE_URL,
    });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(requestText) },
    ];

    let modelUsed = primaryModel;
    let rawJson: unknown;
    let completion: OpenAI.Chat.Completions.ChatCompletion;
    const tModelStart = nowMs();
    try {
      completion = await createCompletionWithTimeout({ openai, model: primaryModel, messages, timeoutMs });
      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Model returned no content");
      rawJson = JSON.parse(extractJson(content));
    } catch (error) {
      // Retry once with a slightly larger model if we time out or fail JSON parsing/shape.
      modelUsed = fallbackModel;
      completion = await createCompletionWithTimeout({ openai, model: fallbackModel, messages, timeoutMs: Math.max(timeoutMs, 15_000) });
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw error instanceof Error ? error : new Error("Model returned no content");
      }
      rawJson = JSON.parse(extractJson(content));
    }
    const tModelEnd = nowMs();

    const tParseStart = nowMs();
    const result = triageSchema.parse(rawJson);
    const safetyResult = runSafetyChecks(parsedRequest.data.requestText, result);
    const tParseEnd = nowMs();

    const timings = debugTimings
      ? {
          totalMs: nowMs() - t0,
          modelCallMs: tModelEnd - tModelStart,
          parseAndEvalMs: tParseEnd - tParseStart,
        }
      : undefined;

    const payload = {
      result,
      safetyResult,
      model: modelUsed,
      timestamp,
      ...(timings ? { timings } : null),
      cache: { hit: false, ttlMs: cacheTtlMs },
    };

    if (cacheTtlMs > 0) {
      cacheSet(cacheKey, {
        expiresAt: cacheNow + cacheTtlMs,
        payload,
      });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Analyse route failed", {
      message: error instanceof Error ? error.message : "Unknown error",
      model: process.env.AI_MODEL || DEFAULT_PRIMARY_MODEL,
      timestamp,
    });

    return NextResponse.json(
      { error: "Triage failed safely. Check the server logs and try again." },
      { status: 500 },
    );
  }
}
