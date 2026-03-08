import { z } from "zod";
import { post } from "../lib/client.js";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_negotiate",
  description:
    "Counter-offer on a transaction's price or terms. Both parties take turns. Use ae_get_transaction to check current offer before negotiating.",
  schema: {
    transaction_id: z.string().uuid().describe("UUID of the transaction to negotiate on"),
    action: z
      .enum(["counter", "accept", "reject"])
      .describe("Negotiation action: counter with new price, accept current offer, or reject"),
    proposed_price_cents: z
      .number()
      .int()
      .optional()
      .describe("Your counter-offer price in cents. Required for 'counter' action."),
    message: z.string().optional().describe("Optional message to the other party explaining your position"),
  },
  handler: async (params, apiKey) => {
    const body: Record<string, unknown> = {
      action: params.action,
    };
    if (params.proposed_price_cents !== undefined) body.proposedPriceCents = params.proposed_price_cents;
    if (params.message !== undefined) body.message = params.message;
    return post(`/transactions/${params.transaction_id}/negotiate`, apiKey, body);
  },
};

export default tool;
