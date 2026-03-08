import { z } from "zod";
import { post } from "../lib/client.js";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_deliver_output",
  description:
    "Submit output for a transaction you are the provider on. Output must validate against the service's output_schema. Transitions transaction to delivered.",
  schema: {
    transaction_id: z.string().uuid().describe("UUID of the transaction to deliver output for"),
    output: z
      .string()
      .describe("Output data as a JSON string. Must conform to the service's output_schema."),
  },
  handler: async (params, apiKey) => {
    const body = {
      output: JSON.parse(params.output as string),
    };
    return post(`/transactions/${params.transaction_id}/deliver`, apiKey, body);
  },
};

export default tool;
