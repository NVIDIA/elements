# NVIDIA Elements MCP App Starter

A minimal MCP App using NVIDIA Elements, TypeScript, and Vite.

## Getting Started

```shell
npm i
npm run dev
```

## MCP Client Configuration

After building the app, configure a local MCP client with the compiled stdio entrypoint:

```json
{
  "mcpServers": {
    "elements-mcp-app": {
      "command": "node",
      "args": ["/path/to/mcp-app/dist/main.js"]
    }
  }
}
```

## Tasks

| Command         | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm run build` | Build the single-file app resource and server JS |
| `npm run dev`   | Build, then open the MCP Inspector               |
| `npm run lint`  | Run eslint                                       |
