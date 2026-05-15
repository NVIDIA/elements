# Elements Lit Library Starter

This file only covers how this starter wires Elements into reusable Lit components. For component APIs, use the Elements CLI/MCP documentation. For production core components, use repository component guidance; this starter is for reusable domain components outside `@nvidia-elements/core`.

## Integration Points

- Export side-effect-free classes from feature `index.ts` files.
- Put custom element registration in sibling `define.ts` files.
- Add every public deep import to `package.json#exports` and `typesVersions`.
- Keep `./**/define.js` in `sideEffects` so bundlers preserve registration entrypoints.

## Composing Elements

- Import Elements classes from side-effect-free entrypoints when using a scoped registry.
- Define composed Elements in the same registry used by `static shadowRootOptions.customElementRegistry`.
- Use `define.js` entrypoints only for global registration tests or consuming app examples.

## Component Authoring

- Keep public props primitive unless an ADR or local requirement justifies the exception.
- Emit standard DOM events with `bubbles: true` and `composed: true` when crossing the shadow root.
- Prefer form-associated custom elements when the domain component behaves as one form control.

## Verification

- Run `pnpm run build`, `pnpm run test`, and `pnpm run lint` in `projects/starters/lit-library` after component, export, or package changes.
