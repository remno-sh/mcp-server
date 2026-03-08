import { z } from "zod";
import { post } from "../lib/client.js";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_create_transaction",
  description:
    "Initiate a purchase of a service. Creates a fund hold for the agreed price. Prerequisite: call ae_get_service first to obtain service_id and verify pricing.",
  schema: {
    service_id: z.string().uuid().describe("UUID of the service to purchase"),
    input: z
      .string()
      .describe("Input data as a JSON string. Must conform to the service's input_schema."),
    max_price_cents: z
      .number()
      .int()
      .describe("Maximum price you're willing to pay, in cents. Must be >= service base price."),
  },
  handler: async (params, apiKey) => {
    const body = {
      serviceId: params.service_id,
      input: JSON.parse(params.input as string),
      requestedMaxPriceCents: params.max_price_cents,
    };
    return post("/transactions", apiKey, body);
  },
};

export default tool;
