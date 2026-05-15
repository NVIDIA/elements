# Elements Angular Starter

This file only covers how this starter wires Elements into Angular. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Register used Elements in the Angular component file that owns the template, as in `src/app/app.ts`.
- Add `CUSTOM_ELEMENTS_SCHEMA` to the standalone component metadata before using `nve-*` tags in `app.html`.
- Keep theme and utility CSS imports in `src/styles.css`; Angular component styles should stay local to component layout refinements.
- Keep `nve-theme` and `nve-transition` on `src/index.html`.

## Angular Syntax

- Use normal Angular template syntax with custom elements: `[property]` for JavaScript properties, `[attr.name]` for attributes, and `(event)` for custom events.
- Boolean attributes on custom elements usually need `[attr.hidden]="condition ? '' : null"` when the attribute semantics matter.
- Use Angular router primitives outside or inside Elements slots normally; Elements do not own Angular state.

## Forms

- Use Elements form wrappers around native inputs so Angular forms keep owning value and validation state.
- Bind Angular reactive forms to the nested native control, not to the `nve-*` wrapper.
- Put Angular conditional rendering for validation messages on `nve-control-message` or around it, depending on the control state.

## Verification

- Run `pnpm run build` in `projects/starters/angular` after schema, import, or template changes.
- Run `pnpm run lint` when editing TypeScript, HTML templates, or CSS.
