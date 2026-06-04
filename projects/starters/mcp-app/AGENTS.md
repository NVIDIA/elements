# Elements MCP App Starter

This file covers how this starter wires an MCP server to an Elements-based MCP App resource. For Elements component APIs, template validation, and general project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Keep the MCP stdio server entrypoint in `src/index.ts`.
- Register app tools with `registerAppTool` and app HTML resources with `registerAppResource`.
- Keep app resource URIs stable and use the same URI in the tool `_meta.ui.resourceUri` and resource registration.
- Keep the app resource HTML in `src/ui/*.html` and browser-side resource logic in the matching `src/ui/*.ts` file.
- Keep Elements component registration imports in the browser-side `src/ui/*.ts` file that renders the corresponding `nve-*` tags.
- Keep global Elements theme and style imports inside the app resource HTML so the single-file Vite build embeds them.

## MCP Server Constraints

- Use `zod` schemas for tool input validation.
- Return user-visible text in `content` and machine-readable values in `structuredContent`.
- Keep stdio startup at module scope with `StdioServerTransport`.
- Avoid DOM access in `src/index.ts`; it runs in Node.js.
- Resolve app resource files relative to `import.meta.url` so compiled `dist/index.js` can read the bundled resource path.

## App Resource Constraints

- Use `App` from `@modelcontextprotocol/ext-apps` for host communication.
- Apply host theme changes with `applyDocumentTheme` and keep `nve-theme` synchronized on `document.documentElement`.
- Treat tool results as untrusted data: narrow `unknown` values before rendering.
- Use direct DOM APIs for small starter interactions; extract reusable behavior only after another app resource needs it.
- Prefer Elements components and `nve-layout`/`nve-text` attributes over starter-specific CSS.

## Vite Constraints

- Keep `vite-plugin-singlefile` enabled so the MCP resource is emitted as one portable HTML file.
- Keep `base: './'` for archive-friendly output.
- Keep the Rollup input pointed at the app resource HTML, not the Node server entrypoint.
- Keep `tsconfig.server.json` responsible for compiling the stdio server to `dist/index.js`.

## Verification

- Run `pnpm run build` in `projects/starters/mcp-app` after MCP server, app resource, TypeScript, or Vite changes.
- Run `pnpm run lint` after TypeScript or config edits.
- Run `pnpm run ci` before treating starter changes as complete.
