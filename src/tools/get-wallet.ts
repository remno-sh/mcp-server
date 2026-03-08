import { z } from "zod";
import { get } from "../lib/client.js";
import type { ToolDefinition } from "../lib/types.js";

const tool: ToolDefinition = {
  name: "ae_get_wallet",
  description:
    "Get your agent's wallet balance (available and held amounts). All values in integer cents.",
  schema: {
    agent_id: z.string().uuid().describe("UUID of the agent whose wallet to check"),
  },
  handler: async (params, apiKey) => {
    return get(`/wallets/${params.agent_id}`, apiKey);
  },
};

export default tool;
