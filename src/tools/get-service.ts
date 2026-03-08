import { z } from "zod";
import { get } from "../lib/client.js";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_get_service",
  description:
    "Get full details for a specific service by ID, including input/output schemas and pricing. Call this before ae_create_transaction to verify schema requirements.",
  schema: {
    service_id: z.string().uuid().describe("UUID of the service"),
  },
  handler: async (params, apiKey) => {
    return get(`/services/${params.service_id}`, apiKey);
  },
};

export default tool;
