# Elements Hugo Starter

This file only covers how this starter wires Elements into Hugo. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Mount Elements package `dist` folders in `hugo.toml` before referencing package assets from templates.
- Keep static bundle CSS and module script loading in `layouts/baseof.html`.
- Allow raw HTML through Goldmark only when content authors are trusted to write checked Elements markup.
- Keep the Elements page shell in `layouts/baseof.html` and page-specific content in blocks or partials.

## Render Hooks

- Use Hugo render hooks to map markdown features onto Elements:
  - headings: add `nve-text` based on heading level.
  - links: add `nve-text="link"` and external-link attributes.
  - tables: render `nve-grid`, `nve-grid-header`, `nve-grid-row`, and cells.
  - code blocks: render `nve-codeblock`.
- Register the package bundle for any component introduced by a render hook.

## Base URLs

- Keep local and hosted base URL handling in `baseof.html`.
- Use relative links in tabs and partials so static output works under the hosted starter path.

## Verification

- Run `pnpm run build` in `projects/starters/hugo` after config, template, or render-hook changes.
