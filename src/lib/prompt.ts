import { formatMockContextForPrompt } from "./mockContext";

export const SYSTEM_PROMPT = `You are an internal AI workflow analyst for a dual-use deep-tech company. Your job is to turn messy internal requests into structured, auditable work. Do not invent facts. Do not promise feasibility. Flag missing information. Identify sensitive/defence/customer data. Keep humans in the loop. Prefer structured workflow suggestions over autonomous action. Output valid JSON only using the requested schema. The system is for internal triage, not final customer commitments. Use the provided mocked context snippets as guidance, but do not claim they are real company policies.`;

export const RESPONSE_SCHEMA_DESCRIPTION = `{
  "summary": string,
  "classification": string,
  "sensitivity": string,                // one of: "low" | "medium" | "high" | "defence-sensitive"
  "extracted_fields": {
    "customer_type": string,
    "use_case": string,
    "urgency": string,
    "deadline": string,
    "requested_output": string
  },
  "missing_information": string[],      // list of concrete missing items needed before progressing
  "suggested_owners": string[],         // 2+ from: Sales, Operations, Software, Security, Compliance, Product, Delivery
  "internal_tasks": string[],           // concrete next-step tasks
  "draft_internal_spec": string,        // short internal-facing spec/brief
  "draft_customer_response": string,    // CAUTIOUS, no commitments, no guarantees
  "risk_notes": string[],
  "audit_notes": string[],              // include titles of mocked context snippets you relied on
  "recommended_human_approval": boolean,
  "confidence": number                  // 0..1
}`;

export function buildUserPrompt(requestText: string): string {
  return [
    "MOCKED INTERNAL CONTEXT SNIPPETS (treat as illustrative guidance only, NOT real company policy):",
    formatMockContextForPrompt(),
    "",
    "INCOMING INTERNAL REQUEST (from sales / ops / customer-facing teams):",
    "---",
    requestText,
    "---",
    "",
    "Respond with VALID JSON ONLY (no markdown, no commentary) matching this schema:",
    RESPONSE_SCHEMA_DESCRIPTION,
    "",
    "Rules:",
    "- Never promise capability, feasibility, pricing, or delivery dates in draft_customer_response.",
    "- For defence/government/border/military/security/surveillance/critical-infrastructure language, sensitivity must NOT be \"low\" and recommended_human_approval must be true.",
    "- For customer-facing requests, recommended_human_approval must be true.",
    "- missing_information must list concrete missing items (AOI, cadence, latency, deadline, decision owner, data source, etc.).",
    "- suggested_owners must include at least 2 sensible owners.",
    "- audit_notes must mention which mocked context snippet titles you used.",
    "- risk_notes must not be empty for sensitive or customer-facing requests.",
  ].join("\n");
}
