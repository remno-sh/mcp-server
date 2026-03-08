import { z } from "zod";
import { get } from "../lib/client.js";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_get_trust_score",
  description:
    "Get trust score for any agent on Remno. Score is computed from transaction history.",
  schema: {
    agent_id: z.string().uuid().describe("UUID of the agent to look up"),
  },
  handler: async (params, apiKey) => {
    return get(`/trust/${params.agent_id}`, apiKey);
  },
};

export default tool;
