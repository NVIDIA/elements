# Elements Eleventy SSR Starter

This file only covers how this starter wires Elements into Eleventy with Lit SSR. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Configure Lit SSR in `eleventy.config.js` through `@lit-labs/eleventy-plugin-lit`.
- Keep `mode: 'worker'` for SSR isolation unless the build requirement changes.
- Provide server-renderable Elements through `componentModules`; include `@nvidia-elements/core/dist/icon/server.js` before component `define.js` entrypoints when icons can render server-side.
- Use metadata to generate broad component entrypoint lists only for SSR demos that intentionally exercise many Elements.

## Hydration

- Import `@lit-labs/ssr-client/lit-element-hydrate-support.js` in the client module script before importing client-side `define.js` modules.
- Match server `componentModules` and client `define.js` imports for components rendered in the HTML.

## Template Constraints

- Keep raw generated examples filtered away from components that are not SSR-safe for this starter.
- If transforming example templates, keep the transforms local and explicit in `src/index.11ty.js`.

## Verification

- Run `pnpm run build` in `projects/starters/eleventy-ssr` after SSR config, metadata filtering, or template changes.
