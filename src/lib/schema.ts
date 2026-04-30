import { z } from "zod";

export const analysisSchema = z.object({
  summary: z.string().min(1),
  classification: z.string().min(1),
  sensitivity: z.string().min(1),
  extracted_fields: z.object({
    customer_type: z.string(),
    use_case: z.string(),
    urgency: z.string(),
    deadline: z.string(),
    requested_output: z.string(),
  }),
  missing_information: z.array(z.string()),
  suggested_owners: z.array(z.string()),
  internal_tasks: z.array(z.string()),
  draft_internal_spec: z.string(),
  draft_customer_response: z.string(),
  risk_notes: z.array(z.string()),
  audit_notes: z.array(z.string()),
  recommended_human_approval: z.boolean(),
  confidence: z.number().min(0).max(1),
});

export type AnalysisResult = z.infer<typeof analysisSchema>;

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
  result: AnalysisResult;
  evalResult: EvalResult;
  model: string;
  timestamp: string;
};
