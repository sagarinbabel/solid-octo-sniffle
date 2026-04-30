import { z } from "zod";

export const extractedFieldsSchema = z.object({
  customer_type: z.string(),
  use_case: z.string(),
  urgency: z.string(),
  deadline: z.string(),
  requested_output: z.string(),
});

export const analysisResultSchema = z.object({
  summary: z.string(),
  classification: z.string(),
  sensitivity: z.string(),
  extracted_fields: extractedFieldsSchema,
  missing_information: z.array(z.string()),
  suggested_owners: z.array(z.string()),
  internal_tasks: z.array(z.string()),
  draft_internal_spec: z.string(),
  draft_customer_response: z.string(),
  risk_notes: z.array(z.string()),
  audit_notes: z.array(z.string()),
  recommended_human_approval: z.boolean(),
  confidence: z.number(),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type ExtractedFields = z.infer<typeof extractedFieldsSchema>;
