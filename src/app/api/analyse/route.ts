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
// Note: NIM Integrate latency can vary significantly by model.
// Defaults chosen for consistent low latency on Integrate.
const DEFAULT_PRIMARY_MODEL = "meta/llama-3.2-1b-instruct";
const DEFAULT_FALLBACK_MODEL = "meta/llama-3.1-8b-instruct";
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_CACHE_TTL_MS = 60_000;
const DEFAULT_CACHE_MAX_ENTRIES = 100;
const DEFAULT_MAX_TOKENS = 220;
const DEFAULT_ENABLE_FALLBACK = false;
const DEFAULT_CONTEXT_CHARS = 80;
const DEFAULT_ENABLE_LOCAL_FALLBACK = true;
const DEFAULT_FORCE_LOCAL = false;

const missingLocalKeyError =
  "NVIDIA NIM API key is missing from .env.local. This prototype intentionally ignores shell environment keys. Create .env.local from .env.example, add NVIDIA_API_KEY, then restart npm run dev.";
const missingProductionKeyError =
  "NVIDIA NIM API key is missing from the server environment. Add NVIDIA_API_KEY in your hosting provider's secure environment variable settings and redeploy.";

const SYSTEM_PROMPT = `You are an internal request-triage assistant. Protect Software/Ops from vague asks while helping Sales get clarity fast.
Rules:
- Output valid JSON only (no markdown).
- Output must start with "{" and end with "}".
- Be concise.
- Never promise feasibility, delivery dates, or customer commitments.
- Allow "software_interrupt_allowed" only if inputs are specific enough to act safely.
`;

function buildUserPrompt(requestText: string) {
  const context = mockedContextSnippets
    .map((item) => `MOCKED CONTEXT - ${item.title}: ${item.body.slice(0, DEFAULT_CONTEXT_CHARS)}`)
    .join("\n");

  const example = `Example output (shape only; do not copy text verbatim):
{
  "clean_title": "Monitoring report ETA request",
  "summary": "Customer wants a delivery ETA; route to Ops and avoid committing dates without confirmation.",
  "request_type": "Customer status update",
  "urgency": "High",
  "business_value": "Low",
  "technical_complexity": "Low",
  "sensitivity": "Customer confidential",
  "missing_information": ["Customer ID", "Which report / time range", "Preferred tone (formal/casual)"],
  "suggested_route": "Ops",
  "suggested_next_action": "Forward to Ops for ETA, then reply to customer with an approved status update.",
  "software_interrupt_allowed": true,
  "draft_clarification_to_sales": "Ops to confirm ETA; please share customer ID and which report they mean.",
  "risk_flags": ["Risk of committing to an unconfirmed date"],
  "recommended_status": "Route to Ops",
  "audit_notes": ["Used MOCKED Sales RFI Intake Checklist", "Used MOCKED Customer Commitment Policy"],
  "confidence": 0.75
}`;

  return `Triage the request for Head of Software review using ONLY the submitted request + mocked context.
Include relevant mocked context TITLES in audit_notes (do not claim they are real).

Hard constraints for speed:
- missing_information: 3-6 items max
- risk_flags: 1-4 items max
- audit_notes: 2-5 items max
- clean_title <= 90 chars
- summary <= 240 chars
- draft_clarification_to_sales <= 240 chars

Return a single JSON object with exactly these keys:
clean_title, summary, request_type, urgency, business_value, technical_complexity, sensitivity,
missing_information, suggested_route, suggested_next_action, software_interrupt_allowed,
draft_clarification_to_sales, risk_flags, recommended_status, audit_notes, confidence.

${example}

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

function coerceJsonObject(raw: string) {
  // Some models return a JSON object but include leading/trailing junk or control chars.
  // We already slice out the first {...} block; now normalize common issues.
  const cleaned = raw
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "")
    .trim();
  return cleaned;
}

function buildLocalFallbackTriage(requestText: string) {
  const lower = requestText.toLowerCase();
  const isDefence = /\bdefen[cs]e\b|\bgovernment\b|\bmilitary\b/.test(lower);
  const isCommitment = /\bpromise\b|\bcommit\b|\bguarantee\b/.test(lower);
  const isStatusUpdate = /\bstatus update\b|\beta\b|\bwhen\b|\bready\b|\bdeliver\b/.test(lower);
  const wantsDemo = /\bdemo\b|\bimpress\b|\bshowcase\b/.test(lower);

  const missing: string[] = [];
  if (isStatusUpdate) missing.push("Customer ID / account", "Which deliverable/report", "Who owns the ETA (Ops/Delivery)");
  if (wantsDemo) missing.push("Customer / opportunity name", "Audience and seniority", "Success criteria for the demo");
  if (isDefence) missing.push("AOI / location", "Handling / approval path for defence-sensitive context");
  if (!missing.length) missing.push("Customer / opportunity name", "What outcome Sales wants", "Decision owner / deadline owner");

  const sensitivity = isDefence ? "Defence-sensitive" : lower.includes("confidential") ? "Customer confidential" : "Unknown";
  const suggested_route = isStatusUpdate ? "Ops" : wantsDemo ? "Sales clarification first; then Software discovery if scoped" : "Sales + Ops + Security before Software discovery";

  return {
    clean_title: wantsDemo
      ? "Demo request — needs scope clarification"
      : isStatusUpdate
        ? "Status update request — route to Ops"
        : "Clarify request before software review",
    summary: wantsDemo
      ? "Sales wants a demo but scope and success criteria are unclear. Clarify before routing to Software."
      : isStatusUpdate
        ? "Customer wants an ETA/status update. Ops should confirm before any customer-facing commitment."
        : "Request lacks enough detail to safely interrupt Software. Collect missing inputs first.",
    request_type: wantsDemo ? "Internal demo request" : isStatusUpdate ? "Customer status update" : "Customer RFI triage",
    urgency: isStatusUpdate ? "High" : "Unknown",
    business_value: wantsDemo ? "Medium" : "Unknown",
    technical_complexity: wantsDemo ? "Medium" : "Unknown",
    sensitivity,
    missing_information: Array.from(new Set(missing)).slice(0, 6),
    suggested_route,
    suggested_next_action: "Ask Sales to provide the missing inputs, then route to the appropriate owner for review.",
    software_interrupt_allowed: false,
    draft_clarification_to_sales:
      "Before Software reviews, please provide the missing details (customer/opportunity, exact ask, decision owner, and any sensitive handling constraints).",
    risk_flags: [
      ...(isDefence ? ["Defence-sensitive context requires human approval"] : []),
      ...(isCommitment ? ["Risk of unapproved customer commitment"] : []),
      ...(isStatusUpdate ? ["Risk of committing to an unconfirmed date"] : []),
    ].slice(0, 4),
    recommended_status: isStatusUpdate ? "Route to Ops" : "Ask Sales for clarification",
    audit_notes: ["Local fallback used due to model timeout", ...mockedContextSnippets.slice(0, 2).map((s) => `Used ${s.title}`)].slice(0, 5),
    confidence: 0.55,
  };
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
  maxTokens,
}: {
  openai: OpenAI;
  model: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  timeoutMs: number;
  maxTokens: number;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await openai.chat.completions.create(
      {
        model,
        temperature: 0.2,
        // Keep completions bounded for latency.
        max_tokens: maxTokens,
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
  const maxTokens = readEnvInt("AI_MAX_TOKENS", DEFAULT_MAX_TOKENS);
  const enableFallback = (process.env.AI_ENABLE_FALLBACK ?? (DEFAULT_ENABLE_FALLBACK ? "1" : "0")) === "1";
  const enableLocalFallback =
    (process.env.AI_ENABLE_LOCAL_FALLBACK ?? (DEFAULT_ENABLE_LOCAL_FALLBACK ? "1" : "0")) === "1";
  const forceLocal = (process.env.AI_FORCE_LOCAL ?? (DEFAULT_FORCE_LOCAL ? "1" : "0")) === "1";
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

    if (forceLocal) {
      const requestText = parsedRequest.data.requestText;
      const fallback = buildLocalFallbackTriage(requestText);
      const result = triageSchema.parse(fallback);
      const safetyResult = runSafetyChecks(requestText, result);
      return NextResponse.json({
        result,
        safetyResult,
        model: "local-fallback",
        timestamp,
        cache: { hit: false, ttlMs: cacheTtlMs },
        ...(debugTimings ? { timings: { totalMs: nowMs() - t0, modelCallMs: 0, parseAndEvalMs: 0 } } : null),
      });
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
      completion = await createCompletionWithTimeout({ openai, model: primaryModel, messages, timeoutMs, maxTokens });
      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Model returned no content");
      try {
        rawJson = JSON.parse(coerceJsonObject(extractJson(content)));
      } catch (err) {
        if (debugTimings) {
          console.error("Model content not JSON (primary)", {
            model: primaryModel,
            preview: content.slice(0, 280),
          });
        }
        throw err;
      }
    } catch (error) {
      // Fail fast by default. The "fallback" retry is optional because it doubles worst-case latency.
      if (!enableFallback) {
        if (enableLocalFallback && error instanceof Error && error.message === "Request was aborted.") {
          const fallback = buildLocalFallbackTriage(requestText);
          const result = triageSchema.parse(fallback);
          const safetyResult = runSafetyChecks(parsedRequest.data.requestText, result);
          return NextResponse.json({
            result,
            safetyResult,
            model: "local-fallback",
            timestamp,
            cache: { hit: false, ttlMs: cacheTtlMs },
            ...(debugTimings ? { timings: { totalMs: nowMs() - t0, modelCallMs: timeoutMs, parseAndEvalMs: 0 } } : null),
          });
        }
        throw error;
      }

      modelUsed = fallbackModel;
      completion = await createCompletionWithTimeout({
        openai,
        model: fallbackModel,
        messages,
        timeoutMs: Math.max(timeoutMs, 15_000),
        maxTokens: Math.max(180, Math.floor(maxTokens * 0.75)),
      });
      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Model returned no content");
      try {
        rawJson = JSON.parse(coerceJsonObject(extractJson(content)));
      } catch (err) {
        if (debugTimings) {
          console.error("Model content not JSON (fallback)", {
            model: fallbackModel,
            preview: content.slice(0, 280),
          });
        }
        throw err;
      }
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
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Analyse route failed", {
      message,
      model: process.env.AI_MODEL || DEFAULT_PRIMARY_MODEL,
      timestamp,
    });

    return NextResponse.json(
      { error: debugTimings ? message : "Triage failed safely. Check the server logs and try again." },
      { status: 500 },
    );
  }
}
