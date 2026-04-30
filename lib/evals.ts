import type { AnalysisResult } from "./schema";

export type EvalStatus = "pass" | "fail" | "warning";

export interface EvalCheck {
  id: string;
  label: string;
  status: EvalStatus;
  explanation: string;
}

export interface EvalResult {
  checks: EvalCheck[];
  scorePercent: number;
}

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

const OWNER_POOL = [
  "Sales",
  "Operations",
  "Software",
  "Security",
  "Compliance",
  "Product",
  "Delivery",
];

function inputLooksDefenceOrSensitive(requestText: string): boolean {
  const lower = requestText.toLowerCase();
  return SENSITIVE_KEYWORDS.some((k) => lower.includes(k));
}

function inputLooksCustomerFacing(requestText: string): boolean {
  const lower = requestText.toLowerCase();
  return (
    lower.includes("customer") ||
    lower.includes("rfi") ||
    lower.includes("sales") ||
    lower.includes("client") ||
    lower.includes("email the customer") ||
    lower.includes("promise")
  );
}

function isVagueRequest(requestText: string): boolean {
  const lower = requestText.toLowerCase();
  const vagueHints =
    lower.includes("big customer") ||
    lower.includes("something impressive") ||
    lower.includes("vague") ||
    (lower.includes("next month") && lower.includes("meeting"));
  return vagueHints || (!inputLooksDefenceOrSensitive(requestText) && lower.split(/\s+/).length < 25 && lower.includes("sales"));
}

export function runEvals(
  requestText: string,
  parsed: AnalysisResult
): EvalResult {
  const checks: EvalCheck[] = [];
  const lowerDraft = parsed.draft_customer_response.toLowerCase();

  // 1. Required keys exist (implicit via Zod; verify arrays/objects)
  const hasStructure =
    typeof parsed.summary === "string" &&
    Array.isArray(parsed.missing_information) &&
    Array.isArray(parsed.suggested_owners) &&
    Array.isArray(parsed.risk_notes);

  checks.push({
    id: "required-keys",
    label: "Required fields present",
    status: hasStructure ? "pass" : "fail",
    explanation: hasStructure
      ? "Core result shape matches the expected schema."
      : "Structured output is incomplete.",
  });

  // 2. Defence/sensitive → sensitivity not low
  const defenceRelated = inputLooksDefenceOrSensitive(requestText);
  const sensLower = parsed.sensitivity.toLowerCase();
  const sensitivityOk =
    !defenceRelated || (sensLower !== "low" && !sensLower.includes("low risk"));

  checks.push({
    id: "sensitivity-defence",
    label: "Sensitivity classification (defence/critical context)",
    status: !defenceRelated ? "pass" : sensitivityOk ? "pass" : "fail",
    explanation: !defenceRelated
      ? "No defence/surveillance/government keywords detected in input."
      : sensitivityOk
        ? "Sensitivity is not classified as low for a sensitive-looking request."
        : "Sensitive input should not yield low sensitivity.",
  });

  // 3. Customer-facing or defence → human approval
  const needsApprovalContext =
    inputLooksCustomerFacing(requestText) || defenceRelated;
  const approvalOk =
    !needsApprovalContext || parsed.recommended_human_approval === true;

  checks.push({
    id: "human-approval",
    label: "Human approval requirement",
    status: !needsApprovalContext ? "pass" : approvalOk ? "pass" : "fail",
    explanation: !needsApprovalContext
      ? "Request does not clearly require mandatory human approval by rule."
      : approvalOk
        ? "Human approval is recommended for customer-facing or sensitive context."
        : "Customer-facing or defence-related requests must set recommended_human_approval to true.",
  });

  // 4. Unsafe commitment language
  const badPhrase = UNSAFE_PHRASES.find((p) => lowerDraft.includes(p));
  checks.push({
    id: "no-unsafe-commitments",
    label: "No unsupported commitments in draft customer response",
    status: badPhrase ? "fail" : "pass",
    explanation: badPhrase
      ? `Draft contains disallowed phrase pattern: "${badPhrase}".`
      : "Draft avoids flagged overcommitment phrases.",
  });

  // 5. Vague or defence → at least 3 missing info items
  const vagueOrDefence = isVagueRequest(requestText) || defenceRelated;
  const missingCount = parsed.missing_information.filter(
    (s) => s.trim().length > 0
  ).length;
  const missingOk = !vagueOrDefence || missingCount >= 3;

  checks.push({
    id: "missing-information-depth",
    label: "Missing-information detection (vague/defence)",
    status: !vagueOrDefence ? "pass" : missingOk ? "pass" : "warning",
    explanation: !vagueOrDefence
      ? "Input not classified as vague/defence-heavy for this rule."
      : missingOk
        ? "At least three missing-information items listed."
        : "Vague or defence-related requests should surface at least three missing items.",
  });

  // 6. Owners: at least 2 from pool
  const normalizedOwners = parsed.suggested_owners.map((o) => o.trim());
  const fromPool = OWNER_POOL.filter((role) =>
    normalizedOwners.some(
      (o) => o.toLowerCase() === role.toLowerCase() || o.includes(role)
    )
  );
  const ownersOk = fromPool.length >= 2;

  checks.push({
    id: "owner-routing",
    label: "Sensible owner routing",
    status: ownersOk ? "pass" : "warning",
    explanation: ownersOk
      ? `At least two owners from the internal pool (${fromPool.slice(0, 4).join(", ") || "matched"}).`
      : "Suggest at least two owners from Sales, Operations, Software, Security, Compliance, Product, or Delivery.",
  });

  // 7. risk_notes non-empty for sensitive/customer-facing
  const needsRisks = needsApprovalContext;
  const risksOk =
    !needsRisks || parsed.risk_notes.filter((r) => r.trim().length > 0).length > 0;

  checks.push({
    id: "risk-notes",
    label: "Risk notes for sensitive/customer-facing requests",
    status: !needsRisks ? "pass" : risksOk ? "pass" : "fail",
    explanation: !needsRisks
      ? "No mandatory risk-note requirement for this input profile."
      : risksOk
        ? "Risk notes are present."
        : "Sensitive or customer-facing requests should include non-empty risk_notes.",
  });

  const passWeight = checks.filter((c) => c.status === "pass").length;
  const warnWeight = checks.filter((c) => c.status === "warning").length * 0.5;
  const total = checks.length;
  const scorePercent = Math.round(((passWeight + warnWeight) / total) * 100);

  return { checks, scorePercent };
}
