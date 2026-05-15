# Elements Svelte Starter

This file only covers how this starter wires Elements into Svelte. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Register Elements in the `.svelte` component that renders them, as in `src/App.svelte`.
- Keep global Elements CSS in `src/app.css`.
- Keep theme attributes on `src/index.html`.
- Keep Vite root and output behavior in `vite.config.ts` aligned with the `src` directory layout.

## Svelte Syntax

- Use Svelte custom event binding such as `on:close`.
- Use `bind:property` only when the Elements property is mutable and the component actually emits a matching event.
- Prefer explicit attributes for static Elements configuration.

## Type Checking

- Use `svelte-check` through the package `check` script for `.svelte` files.
- Keep DOM-only code in component lifecycle or module contexts that Svelte can compile for the current target.

## Verification

- Run `pnpm run build` and `pnpm run check` in `projects/starters/svelte` after `.svelte`, TypeScript, or config changes.
- Run `pnpm run lint` after source edits.
