# Elements Import Maps Starter

This file only covers how this starter wires Elements through browser import maps. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Keep the import map in `src/index.html` aligned with the packages copied by `build.js`.
- Map both bare package names and trailing-slash subpaths for Lit packages and `@nvidia-elements/core`.
- Import individual `define.js` files from the mapped `@nvidia-elements/core/` prefix.
- Load CSS with normal `<link>` tags because there is no bundler to process CSS imports.

## Static Copy Script

- Update `build.js` whenever the import map references a new package that must exist in `dist/node_modules`.
- Copy package `dist` folders for Elements packages; copy full dependency folders only when browser subpath imports require them.
- Keep the copy list explicit.

## Constraints

- Use this starter for no-build prototypes and browser-native module loading.
- Prefer a Vite starter when tree-shaking, TypeScript transforms, or production bundling matter.

## Verification

- Run `pnpm run build` in `projects/starters/importmaps` after import map or copy script changes.
- Use `pnpm run dev` to catch browser import resolution errors.
