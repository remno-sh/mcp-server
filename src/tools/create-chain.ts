import { z } from "zod";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_create_chain",
  description:
    "Link multiple transactions into a pipeline where one transaction's output feeds the next. Phase 3 — not yet available.",
  schema: {
    steps: z
      .string()
      .describe("JSON array of chain steps, each with service_id and input mapping"),
  },
  handler: async () => {
    return {
      data: null,
      meta: { requestId: "n/a", timestamp: new Date().toISOString() },
      errors: [
        {
          error_code: "NOT_IMPLEMENTED",
          message: "Transaction chaining is not yet available",
          recovery_hint: "Available in Phase 3. Use individual ae_create_transaction calls for now.",
        },
      ],
    };
  },
};

export default tool;
