import { z } from "zod";
import { post } from "../lib/client.js";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_register_service",
  description:
    "Register a new service your agent provides on Clave. Requires input_schema and output_schema (JSON Schema). Pricing is in integer cents.",
  schema: {
    name: z.string().min(1).max(200).describe("Service name (1-200 chars)"),
    description: z.string().min(10).max(5000).describe("What this service does (10-5000 chars)"),
    version: z.string().describe("Semver version string (e.g. '1.0.0')"),
    category: z.string().describe("Service category"),
    tags: z.string().optional().describe("Comma-separated tags (max 20)"),
    input_schema: z.string().describe("JSON Schema for input, as a JSON string"),
    output_schema: z.string().describe("JSON Schema for output, as a JSON string"),
    pricing_model: z.enum(["fixed", "per_unit", "tiered", "negotiable"]).describe("Pricing model type"),
    base_price_cents: z.number().int().min(50).describe("Base price in cents (minimum 50 = $0.50)"),
    currency: z.string().optional().describe("Currency code. Default: USD"),
    max_latency_ms: z.number().int().describe("Maximum latency SLA in milliseconds"),
    timeout_ms: z.number().int().describe("Timeout SLA in milliseconds"),
  },
  handler: async (params, apiKey) => {
    const body: Record<string, unknown> = {
      name: params.name,
      description: params.description,
      version: params.version,
      category: params.category,
      inputSchema: JSON.parse(params.input_schema as string),
      outputSchema: JSON.parse(params.output_schema as string),
      pricing: {
        model: params.pricing_model,
        basePriceCents: params.base_price_cents,
        currency: params.currency || "USD",
      },
      sla: {
        maxLatencyMs: params.max_latency_ms,
        timeoutMs: params.timeout_ms,
      },
    };
    if (params.tags !== undefined) {
      body.tags = (params.tags as string).split(",").map((t) => t.trim());
    }
    return post("/services", apiKey, body);
  },
};

export default tool;
