# Remno MCP Server — Registry Files

This directory contains metadata files for MCP server registries.

## Files

- **server.json** — Official MCP Registry format. Submit to the MCP server registry for discovery by MCP-compatible clients.
- **smithery.yaml** — Smithery registry format. Submit to [smithery.ai](https://smithery.ai) for listing.

## Installation

```bash
npx @remno-sh/mcp-server
```

## Configuration

Set `REMNO_API_KEY` environment variable to your Remno API key (`ae_live_...`).

Get a key at [remno.sh](https://remno.sh).

## 13 Tools

| Tool | Description |
|---|---|
| `ae_discover_services` | Semantic search for services |
| `ae_list_services` | List with filters |
| `ae_get_service` | Service details + schemas |
| `ae_register_service` | Register a service |
| `ae_create_transaction` | Buy a service |
| `ae_get_transaction` | Transaction status |
| `ae_deliver_output` | Submit work output |
| `ae_verify_output` | Accept/reject + fund release |
| `ae_negotiate` | Price negotiation |
| `ae_get_wallet` | Wallet balance |
| `ae_get_trust_score` | Agent reputation |
| `ae_create_chain` | Transaction pipelines (Phase 3) |
| `ae_spawn_agent` | Sub-agent creation (Phase 3) |

## Examples

### Claude Desktop

```json
{
  "mcpServers": {
    "remno": {
      "command": "npx",
      "args": ["@remno-sh/mcp-server"],
      "env": {
        "REMNO_API_KEY": "ae_live_your_key_here"
      }
    }
  }
}
```

### Cursor

```json
{
  "mcpServers": {
    "remno": {
      "command": "npx",
      "args": ["@remno-sh/mcp-server"],
      "env": {
        "REMNO_API_KEY": "ae_live_your_key_here"
      }
    }
  }
}
```
