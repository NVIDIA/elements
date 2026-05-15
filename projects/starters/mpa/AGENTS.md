# Elements MPA Starter

This file only covers how this starter wires Elements into a Vite multi-page app. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Keep shared Elements CSS in `src/common/index.css`.
- Keep shared Elements registrations in `src/common/index.ts`.
- Import `./common/index.js` from each page entrypoint before page-specific code.
- Add new HTML pages to `vite.config.ts` `build.rolldownOptions.input`.

## Page Structure

- Each page owns its `<title>`, metadata, stylesheet link, and module script.
- Keep selected navigation state local to each page's static HTML.
- Use root-relative dev paths in source HTML when Vite owns serving; verify build output after adding nested pages.

## View Transitions

- Keep `nve-transition` on the root HTML for global transitions.
- Add component-level transition attributes only to pages that need them.

## Verification

- Run `pnpm run build` in `projects/starters/mpa` after adding pages or changing shared entries.
- Run `pnpm run lint` after TypeScript or config changes.
