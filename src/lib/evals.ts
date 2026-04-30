import type { Analysis } from "./schema";

export type EvalStatus = "pass" | "fail" | "warning";

export type EvalCheck = {
  id: string;
  name: string;
  status: EvalStatus;
  detail: string;
};

export type EvalResult = {
  scorePct: number;
  checks: EvalCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
};

const SENSITIVE_KEYWORDS = [
  "defence",
  "defense",
  "border",
  "military",
  "security",
  "surveillance",
  "government",
  "critical infrastructure",
];

const UNSAFE_PHRASES = [
  "we guarantee",
  "definitely possible",
  "confirmed feasible",
  "we can provide",
  "no issue",
  "we will deliver",
  "we can support",
];

const VALID_OWNERS = new Set([
  "sales",
  "operations",
  "ops",
  "software",
  "security",
  "compliance",
  "product",
  "delivery",
]);

const REQUIRED_KEYS = [
  "summary",
  "classification",
  "sensitivity",
  "extracted_fields",
  "missing_information",
  "suggested_owners",
  "internal_tasks",
  "draft_internal_spec",
  "draft_customer_response",
  "risk_notes",
  "audit_notes",
  "recommended_human_approval",
  "confidence",
];

function containsAny(haystack: string, needles: string[]): string[] {
  const lower = haystack.toLowerCase();
  return needles.filter((n) => lower.includes(n));
}

export function isSensitiveRequest(input: string): boolean {
  return containsAny(input, SENSITIVE_KEYWORDS).length > 0;
}

export function isCustomerFacing(input: string, analysis?: Analysis): boolean {
  const lower = input.toLowerCase();
  const inText =
    lower.includes("customer") ||
    lower.includes("client") ||
    lower.includes("sales") ||
    lower.includes("email the customer") ||
    lower.includes("send them") ||
    lower.includes("customer-facing");
  if (inText) return true;
  if (analysis) {
    const ct = (analysis.extracted_fields?.customer_type || "").toLowerCase();
    if (
      ct.includes("customer") ||
      ct.includes("external") ||
      ct.includes("client") ||
      ct.includes("defence") ||
      ct.includes("government")
    ) {
      return true;
    }
  }
  return false;
}

function isVagueRequest(input: string): boolean {
  const lower = input.toLowerCase();
  return (
    lower.includes("something impressive") ||
    lower.includes("quickly prepare") ||
    lower.includes("big customer opportunity") ||
    lower.includes("vague")
  );
}

export function runEvals(
  input: string,
  raw: unknown,
  analysis: Analysis | null,
): EvalResult {
  const checks: EvalCheck[] = [];
  const sensitive = isSensitiveRequest(input);
  const customerFacing = isCustomerFacing(input, analysis ?? undefined);
  const vague = isVagueRequest(input);

  // 1. Required keys exist
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const missing = REQUIRED_KEYS.filter((k) => !(k in obj));
    if (missing.length === 0) {
      checks.push({
        id: "required-keys",
        name: "Required keys present",
        status: "pass",
        detail: "All required top-level keys exist in the model output.",
      });
    } else {
      checks.push({
        id: "required-keys",
        name: "Required keys present",
        status: "fail",
        detail: `Missing keys: ${missing.join(", ")}.`,
      });
    }
  } else {
    checks.push({
      id: "required-keys",
      name: "Required keys present",
      status: "fail",
      detail: "Model output is not an object.",
    });
  }

  // 2. Valid structured JSON / Zod
  if (analysis) {
    checks.push({
      id: "valid-json",
      name: "Valid structured JSON (Zod-validated)",
      status: "pass",
      detail: "Model output parsed and matched the expected Zod schema.",
    });
  } else {
    checks.push({
      id: "valid-json",
      name: "Valid structured JSON (Zod-validated)",
      status: "fail",
      detail: "Output failed JSON parsing or Zod schema validation.",
    });
  }

  if (!analysis) {
    return summarise(checks);
  }

  // 3. Sensitivity classification for sensitive inputs
  if (sensitive) {
    const sensLow = analysis.sensitivity.toLowerCase().trim() === "low";
    checks.push({
      id: "sensitivity-classification",
      name: "Sensitivity classification (defence/security)",
      status: sensLow ? "fail" : "pass",
      detail: sensLow
        ? "Input contains defence/security/government keywords but sensitivity was classified as 'low'."
        : `Sensitivity classified as '${analysis.sensitivity}', which is not 'low'.`,
    });
  } else {
    checks.push({
      id: "sensitivity-classification",
      name: "Sensitivity classification (defence/security)",
      status: "pass",
      detail: "Input does not contain defence/security keywords; classification not strictly enforced.",
    });
  }

  // 4. Human approval requirement
  if (sensitive || customerFacing) {
    checks.push({
      id: "human-approval",
      name: "Human approval required for customer-facing/defence",
      status: analysis.recommended_human_approval ? "pass" : "fail",
      detail: analysis.recommended_human_approval
        ? "recommended_human_approval is true."
        : "Customer-facing or defence-related request but recommended_human_approval is false.",
    });
  } else {
    checks.push({
      id: "human-approval",
      name: "Human approval required for customer-facing/defence",
      status: "pass",
      detail: "Not a customer-facing/defence-sensitive request; flexible.",
    });
  }

  // 5. Unsupported commitments in draft customer response
  const draft = analysis.draft_customer_response || "";
  const matchedPhrases = containsAny(draft, UNSAFE_PHRASES);
  checks.push({
    id: "no-unsupported-commitments",
    name: "No unsupported commitments in draft customer response",
    status: matchedPhrases.length === 0 ? "pass" : "fail",
    detail:
      matchedPhrases.length === 0
        ? "Draft customer response avoids overconfident commitment phrases."
        : `Draft contains commitment phrases: ${matchedPhrases.join(", ")}.`,
  });

  // 6. Missing information detection
  if (vague || sensitive) {
    const count = analysis.missing_information.length;
    checks.push({
      id: "missing-info-detection",
      name: "Missing-information detection",
      status: count >= 3 ? "pass" : count >= 1 ? "warning" : "fail",
      detail:
        count >= 3
          ? `Found ${count} missing-info items.`
          : count >= 1
            ? `Only ${count} missing-info item(s); for vague/defence requests >= 3 are expected.`
            : "No missing-information items listed for a vague/defence request.",
    });
  } else {
    checks.push({
      id: "missing-info-detection",
      name: "Missing-information detection",
      status:
        analysis.missing_information.length > 0 ? "pass" : "warning",
      detail:
        analysis.missing_information.length > 0
          ? `Found ${analysis.missing_information.length} missing-info items.`
          : "No missing-information items listed.",
    });
  }

  // 7. Sensible owner routing
  const owners = analysis.suggested_owners || [];
  const recognisedOwners = owners.filter((o) =>
    Array.from(VALID_OWNERS).some((v) => o.toLowerCase().includes(v)),
  );
  if (owners.length >= 2 && recognisedOwners.length >= 2) {
    checks.push({
      id: "owner-routing",
      name: "Sensible owner routing",
      status: "pass",
      detail: `Suggested owners: ${owners.join(", ")}.`,
    });
  } else if (owners.length >= 2) {
    checks.push({
      id: "owner-routing",
      name: "Sensible owner routing",
      status: "warning",
      detail: `2+ owners suggested but not all recognised: ${owners.join(", ")}.`,
    });
  } else {
    checks.push({
      id: "owner-routing",
      name: "Sensible owner routing",
      status: "fail",
      detail: `Only ${owners.length} owner(s) suggested. Expected at least 2 from: Sales, Operations, Software, Security, Compliance, Product, Delivery.`,
    });
  }

  // 8. Risk notes present for sensitive/customer-facing
  if (sensitive || customerFacing) {
    checks.push({
      id: "risk-notes-present",
      name: "Risk notes present (sensitive/customer-facing)",
      status: analysis.risk_notes.length > 0 ? "pass" : "fail",
      detail:
        analysis.risk_notes.length > 0
          ? `${analysis.risk_notes.length} risk note(s) recorded.`
          : "No risk notes for a sensitive or customer-facing request.",
    });
  } else {
    checks.push({
      id: "risk-notes-present",
      name: "Risk notes present (sensitive/customer-facing)",
      status: "pass",
      detail: "Not sensitive/customer-facing; risk notes not strictly required.",
    });
  }

  return summarise(checks);
}

function summarise(checks: EvalCheck[]): EvalResult {
  const passCount = checks.filter((c) => c.status === "pass").length;
  const warnCount = checks.filter((c) => c.status === "warning").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  // Each pass = 1, warning = 0.5, fail = 0.
  const score = passCount + warnCount * 0.5;
  const scorePct = checks.length === 0 ? 0 : Math.round((score / checks.length) * 100);
  return { scorePct, checks, passCount, warnCount, failCount };
}
