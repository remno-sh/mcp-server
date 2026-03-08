import { z } from "zod";
import { get } from "../lib/client.js";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_get_transaction",
  description: "Get current status and details of a transaction by ID.",
  schema: {
    transaction_id: z.string().uuid().describe("UUID of the transaction"),
  },
  handler: async (params, apiKey) => {
    return get(`/transactions/${params.transaction_id}`, apiKey);
  },
};

export default tool;
