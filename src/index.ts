#!/usr/bin/env node

import { createServer as createHttpServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ClaveApiError } from "./lib/client.js";
import type { ToolDefinition } from "./lib/types.js";

import discoverServices from "./tools/discover-services.js";
import listServices from "./tools/list-services.js";
import getService from "./tools/get-service.js";
import registerService from "./tools/register-service.js";
import createTransaction from "./tools/create-transaction.js";
import getTransaction from "./tools/get-transaction.js";
import deliverOutput from "./tools/deliver-output.js";
import verifyOutput from "./tools/verify-output.js";
import negotiate from "./tools/negotiate.js";
import getWallet from "./tools/get-wallet.js";
import getTrustScore from "./tools/get-trust-score.js";
import createChain from "./tools/create-chain.js";
import spawnAgent from "./tools/spawn-agent.js";

const tools: ToolDefinition[] = [
  discoverServices,
  listServices,
  getService,
  registerService,
  createTransaction,
  getTransaction,
  deliverOutput,
  verifyOutput,
  negotiate,
  getWallet,
  getTrustScore,
  createChain,
  spawnAgent,
];

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "clave",
    version: "1.0.0",
  });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.schema,
      },
      async (params: Record<string, unknown>, extra) => {
        const apiKey =
          (extra?._meta as Record<string, unknown> | undefined)?.apiKey as string | undefined
          || process.env.CLAVE_API_KEY
          || "";

        if (!apiKey) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  error_code: "AUTH_REQUIRED",
                  message: "No API key provided",
                  recovery_hint:
                    "Set CLAVE_API_KEY environment variable or pass apiKey in request metadata.",
                }),
              },
            ],
            isError: true,
          };
        }

        try {
          const result = await tool.handler(params, apiKey);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result),
              },
            ],
          };
        } catch (error) {
          if (error instanceof ClaveApiError) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: JSON.stringify(error.toMcpError()),
                },
              ],
              isError: true,
            };
          }
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  error_code: "INTERNAL_ERROR",
                  message: error instanceof Error ? error.message : "Unknown error",
                  recovery_hint: "This is unexpected. Retry or report the issue.",
                }),
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  return server;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id",
};

const port = parseInt(process.env.PORT || "3001", 10);

const httpServer = createHttpServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // Health check
  if (url.pathname === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json", ...CORS_HEADERS });
    res.end(JSON.stringify({ status: "ok", server: "clave-mcp", version: "1.0.0" }));
    return;
  }

  // MCP endpoint
  if (url.pathname === "/mcp") {
    // Add CORS headers to response
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      res.setHeader(key, value);
    }

    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless
    });

    await server.connect(transport);
    await transport.handleRequest(req, res);
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

httpServer.listen(port, () => {
  console.log(`Clave MCP server running on http://localhost:${port}`);
  console.log(`  POST /mcp    — MCP endpoint`);
  console.log(`  GET  /health — Health check`);
});
