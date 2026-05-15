# Elements Eleventy Starter

This file only covers how this starter wires Elements into Eleventy. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Keep global Elements CSS in `src/_layouts/index.css`.
- Register Elements used by layout or markdown content in `src/_layouts/index.ts`.
- Keep shared page shell markup in `src/_layouts/index.11ty.js`; page files should supply content.
- Use `@11ty/eleventy-plugin-vite` for bundling the layout entrypoint.

## Markdown Rendering

- Add `nve-text` and `nve-layout` attributes through the markdown-it renderer in `eleventy.config.js` when markdown should receive Elements typography.
- Keep renderer mappings constrained to token types that markdown-it exposes predictably: headings, paragraphs, links, and lists.
- Let raw `nve-*` HTML pass through markdown only when the page intentionally owns that markup.

## Routing

- Keep the `<base>` URL and Vite `base` aligned with `PAGES_BASE_URL`.
- Use relative links in generated tab markup so static output works under the starter base path.

## Verification

- Run `pnpm run build` in `projects/starters/eleventy` after layout, renderer, or asset pipeline changes.
- Run `pnpm run lint` when editing Eleventy config or layout TypeScript.
