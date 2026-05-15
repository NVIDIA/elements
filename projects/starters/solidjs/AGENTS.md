# Elements SolidJS Starter

This file only covers how this starter wires Elements into SolidJS. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Register Elements in the Solid component module that renders the tags, as in `src/App.tsx`.
- Keep Elements JSX augmentation in `src/types.d.ts` by extending `solid-js` JSX `IntrinsicElements`.
- Keep global Elements CSS in `src/index.css`.
- Keep theme attributes on `src/index.html`.

## TSX Syntax

- Use Solid's native custom element support with lowercase `nve-*` tags.
- Use event props such as `onclose` for custom Events.
- Use primitive reactive expressions for properties.
- Use explicit empty-string attributes where Solid serializes boolean attributes in static markup.

## Verification

- Run `pnpm run build` in `projects/starters/solidjs` after TSX, type, or import changes.
- Run `pnpm run lint` after Solid source edits.
