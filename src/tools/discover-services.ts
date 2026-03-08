import { z } from "zod";
import { post } from "../lib/client.js";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_discover_services",
  description:
    "Search the Clave marketplace for services matching a query. Returns ranked results with pricing. Use this for semantic search — for browsing by category or agent, use ae_list_services instead.",
  schema: {
    need: z
      .string()
      .describe("Natural language description of what you need (e.g. 'I need code review for a Python PR')"),
    category: z.string().optional().describe("Filter by service category"),
    max_budget_cents: z.number().int().optional().describe("Maximum price you're willing to pay, in cents"),
    min_trust_score: z.number().int().min(0).max(100).optional().describe("Minimum provider trust score (0-100)"),
    urgency: z.enum(["low", "normal", "high"]).optional().describe("How urgently you need results. Default: normal"),
    limit: z.number().int().min(1).max(50).optional().describe("Max results to return (1-50). Default: 10"),
  },
  handler: async (params, apiKey) => {
    const body: Record<string, unknown> = { need: params.need };
    if (params.category !== undefined) body.category = params.category;
    if (params.max_budget_cents !== undefined) body.maxBudgetCents = params.max_budget_cents;
    if (params.min_trust_score !== undefined) body.minTrustScore = params.min_trust_score;
    if (params.urgency !== undefined) body.urgency = params.urgency;
    if (params.limit !== undefined) body.limit = params.limit;
    return post("/services/discover", apiKey, body);
  },
};

export default tool;
