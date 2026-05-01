import { z } from "zod";

export const urgencySchema = z.enum(["Low", "Medium", "High", "Unknown"]);
export const businessValueSchema = z.enum(["Low", "Medium", "High", "Unknown"]);
export const technicalComplexitySchema = z.enum(["Low", "Medium", "High", "Unknown"]);
export const sensitivitySchema = z.enum(["Normal", "Customer confidential", "Defence-sensitive", "Unknown"]);

export const triageSchema = z.object({
  clean_title: z.string().min(1),
  summary: z.string().min(1),
  request_type: z.string().min(1),
  urgency: urgencySchema,
  business_value: businessValueSchema,
  technical_complexity: technicalComplexitySchema,
  sensitivity: sensitivitySchema,
  missing_information: z.array(z.string()),
  suggested_route: z.string().min(1),
  suggested_next_action: z.string().min(1),
  software_interrupt_allowed: z.boolean(),
  draft_clarification_to_sales: z.string(),
  risk_flags: z.array(z.string()),
  recommended_status: z.string().min(1),
  audit_notes: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type TriageResult = z.infer<typeof triageSchema>;

export type EvalStatus = "pass" | "fail" | "warning";

export type EvalCheck = {
  id: string;
  label: string;
  status: EvalStatus;
  explanation: string;
};

export type EvalResult = {
  score: number;
  checks: EvalCheck[];
  disclaimer: string;
};

export type AnalyseResponse = {
  result: TriageResult;
  safetyResult: EvalResult;
  model: string;
  timestamp: string;
};
