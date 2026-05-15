# Elements React Starter

This file only covers how this starter wires Elements into React. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Register Elements in the React module that renders the corresponding `nve-*` tags, as in `src/App.tsx`.
- Keep global theme CSS in `src/index.css`.
- Keep `nve-theme` and `nve-transition` on `src/index.html`.
- Keep JSX custom element type augmentation in `src/global.d.ts`.

## JSX Syntax

- Use direct custom elements for React 19.
- Use lowercase custom event props such as `onclose` for an Elements `close` event.
- Pass primitive values as JSX props when setting JavaScript properties.
- Use string attributes when the Elements API is attribute-driven.

## Verification

- Run `pnpm run build` in `projects/starters/react` after TSX, type, or import changes.
- Run `pnpm run lint` after React source edits.
