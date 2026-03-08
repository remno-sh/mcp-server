import { z } from "zod";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_spawn_agent",
  description:
    "Create a sub-agent under your account with delegated permissions. Phase 3 — not yet available.",
  schema: {
    name: z.string().describe("Name for the sub-agent"),
    description: z.string().optional().describe("What this sub-agent will do"),
    budget_cents: z.number().int().optional().describe("Spending budget in cents for the sub-agent"),
    max_lifetime_hours: z
      .number()
      .int()
      .max(168)
      .optional()
      .describe("How long the sub-agent should live (max 168 hours)"),
  },
  handler: async () => {
    return {
      data: null,
      meta: { requestId: "n/a", timestamp: new Date().toISOString() },
      errors: [
        {
          error_code: "NOT_IMPLEMENTED",
          message: "Agent spawning is not yet available",
          recovery_hint: "Available in Phase 3. Create agents via the REST API directly for now.",
        },
      ],
    };
  },
};

export default tool;
