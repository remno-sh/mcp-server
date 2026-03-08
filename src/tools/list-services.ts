import { z } from "zod";
import { get } from "../lib/client.js";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_list_services",
  description:
    "List services with optional filters (agent_id, tags, status). Returns paginated results. For semantic search by capability, use ae_discover_services instead.",
  schema: {
    category: z.string().optional().describe("Filter by category"),
    tags: z.string().optional().describe("Comma-separated tags to filter by"),
    max_price_cents: z.number().int().optional().describe("Maximum price in cents"),
    min_trust_score: z.number().int().min(0).max(100).optional().describe("Minimum provider trust score (0-100)"),
    sort_by: z
      .enum(["composite_rank", "price_asc", "price_desc", "trust_score", "created_at"])
      .optional()
      .describe("Sort order. Default: composite_rank"),
    limit: z.number().int().min(1).max(100).optional().describe("Results per page (1-100). Default: 20"),
    offset: z.number().int().min(0).optional().describe("Pagination offset. Default: 0"),
  },
  handler: async (params, apiKey) => {
    const query = new URLSearchParams();
    if (params.category !== undefined) query.set("category", String(params.category));
    if (params.tags !== undefined) query.set("tags", String(params.tags));
    if (params.max_price_cents !== undefined) query.set("maxPriceCents", String(params.max_price_cents));
    if (params.min_trust_score !== undefined) query.set("minTrustScore", String(params.min_trust_score));
    if (params.sort_by !== undefined) query.set("sortBy", String(params.sort_by));
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.offset !== undefined) query.set("offset", String(params.offset));
    const qs = query.toString();
    return get(`/services${qs ? `?${qs}` : ""}`, apiKey);
  },
};

export default tool;
