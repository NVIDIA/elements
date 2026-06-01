# Elements MCP App Starter

This file only covers how this starter wires Elements into an MCP App. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Register Elements in `src/mcp-app.ts`.
- Keep global Elements CSS in `src/mcp-app.css`.
- Keep the MCP App HTML entry in `mcp-app.html`.
- Keep `server.ts` as the single place that registers MCP tools and app resources.
- Keep `main.ts` limited to stdio transport startup.

## MCP App Usage

- Register one MCP tool with `_meta.ui.resourceUri`.
- Register a matching `ui://` app resource with `registerAppResource`.
- Keep the app resource bundled as one HTML file with `vite-plugin-singlefile`.
- Use `App` from `@modelcontextprotocol/ext-apps` in browser code.

## Verification

- Run `pnpm run build` in `projects/starters/mcp-app` after HTML, TypeScript, CSS, or Vite changes.
- Run `pnpm run lint` after TypeScript edits.
