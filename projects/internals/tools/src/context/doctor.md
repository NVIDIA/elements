# Elements Design System Doctor / Setup Check

Instructions for ensuring the Elements Design System is setup correctly

## Tools to use

- `project_validate`: check project setup and find configuration issues

## MCP Checks

Ensure the MCP is properly configured and working as expected.

### Cursor

`.cursor/mcp.json`

```json
{
  "mcpServers": {
    "elements": {
      "description": "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples",
      "command": "nve mcp"
    }
  }
}
```

### Claude Code

`./.mcp.json`

```json
{
  "mcpServers": {
    "elements": {
      "description": "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples",
      "command": "nve",
      "args": ["mcp"]
    }
  }
}
```
