# NVIDIA Elements + MCP App Starter

A minimal MCP App using NVIDIA Elements, TypeScript, and Vite.

## Getting Started

```shell
npm i
npm run build
npm run dev
```

## MCP Client Configuration

After building the app, configure a local MCP client with the compiled stdio entrypoint:

```json
{
  "mcpServers": {
    "elements-demo-mcp-app": {
      "command": "node",
      "args": ["/path/to/mcp-app/dist/index.js"]
    }
  }
}
```

## Tasks

| Command         | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm run build` | Build the single-file app resource and server JavaScript |
| `npm run dev`   | Open the MCP Inspector with the built server             |
| `npm run lint`  | Lint the TypeScript source                               |
