# Elements TypeScript Starter

This file only covers how this starter wires Elements into a Vite TypeScript app. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Register Elements in `src/index.ts`.
- Keep global Elements CSS in `src/index.css`.
- Keep the module script pointing at `./index.ts` from `src/index.html`.
- Keep root theme attributes on `src/index.html`.

## TypeScript Usage

- Import component classes as `type` imports when querying or narrowing DOM elements.
- Use `querySelector<ComponentType>('nve-component')` for local DOM access.
- Attach custom event listeners with `addEventListener`.
- Keep page-specific behavior in `src/index.ts`; extract reusable behavior only after another page or component needs it.

## Vite Constraints

- Keep `base: './'` for archive-friendly static output.
- Keep source paths relative to the `src` root established by `vite.config.ts`.

## Verification

- Run `pnpm run build` in `projects/starters/typescript` after HTML, TypeScript, CSS, or Vite changes.
- Run `pnpm run lint` after TypeScript edits.
