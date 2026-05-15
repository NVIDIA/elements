# Elements Bundles Starter

This file only covers how this starter wires Elements into a static bundle page. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Load pre-built CSS bundles from `@nvidia-elements/styles`, `@nvidia-elements/themes`, and any optional package bundle in `src/index.html`.
- Load pre-built JavaScript bundles with module scripts in `src/index.html`.
- Keep bundle paths rooted through the Vite alias for `./node_modules` from `vite.config.ts`.
- Use this starter only when loading all registered components is acceptable; it trades tree-shaking for drop-in integration.

## Optional Package Bundles

- Include an optional package bundle only when the page uses that package. The current starter includes Monaco because it renders `nve-monaco-input`.
- Pair optional package JavaScript and CSS bundles when the package ships both.

## DOM Events

- Attach listeners with script code, not inline event handler attributes.
- Query typed Elements only after the bundle import has run.

## Verification

- Run `pnpm run build` in `projects/starters/bundles` after changing bundle paths or static HTML.
- Run `pnpm run dev` only when visual browser verification is needed.
