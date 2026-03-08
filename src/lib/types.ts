import type { z } from "zod";

export interface ToolDefinition {
  name: string;
  description: string;
  schema: Record<string, z.ZodType>;
  handler: (params: Record<string, unknown>, apiKey: string) => Promise<unknown>;
}

export interface McpError {
  error_code: string;
  message: string;
  recovery_hint: string;
}
