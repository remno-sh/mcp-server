import { z } from "zod";
import { post } from "../lib/client.js";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_verify_output",
  description:
    "Verify delivered output against the service contract as the buyer. Pass or fail. Passing triggers fund release to provider.",
  schema: {
    transaction_id: z.string().uuid().describe("UUID of the transaction to verify"),
    accepted: z.boolean().describe("true to accept and release funds, false to reject"),
    quality_score: z.number().int().min(0).max(100).optional().describe("Quality rating 0-100. Optional but recommended."),
    rejection_reason: z.string().optional().describe("Reason for rejection. Required if accepted is false."),
  },
  handler: async (params, apiKey) => {
    const body: Record<string, unknown> = {
      accepted: params.accepted,
    };
    if (params.quality_score !== undefined) body.qualityScore = params.quality_score;
    if (params.rejection_reason !== undefined) body.rejectionReason = params.rejection_reason;
    return post(`/transactions/${params.transaction_id}/verify`, apiKey, body);
  },
};

export default tool;
