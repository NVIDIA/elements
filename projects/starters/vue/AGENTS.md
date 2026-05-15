# Elements Vue Starter

This file only covers how this starter wires Elements into Vue. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Keep `template.compilerOptions.isCustomElement` in `vite.config.ts` so Vue treats `nve-*` tags as custom elements.
- Keep `custom-elements-vue.d.ts` referenced from `env.d.ts`.
- Keep `env.d.ts` included by `tsconfig.app.json`.
- Register Elements in the SFC that renders them, as in `src/App.vue`.
- Keep global Elements CSS in `src/main.css`.

## Vue Syntax

- Use `:property` for custom element properties.
- Use `@event` for custom Events.
- Use plain attributes for static string values.
- Keep router links or app-specific components inside Elements slots normally.

## Type Checking

- Use `vue-tsc` through the package build so invalid Elements attributes fail CI.
- If a new `nve-*` tag has no template type, verify the referenced generated type file includes it before adding local declarations.

## Verification

- Run `pnpm run build` in `projects/starters/vue` after Vue, type, or config changes.
- Run `pnpm run lint` after source edits.
