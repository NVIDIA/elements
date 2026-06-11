# Elements HTMX + Go Starter

This file only covers how this starter wires Elements into Go templates and HTMX fragment responses. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Render Elements markup through `html/template` in `src/index.html`.
- Render the full page through the root route.
- Keep HTMX swap content in fragment templates under `src/`.
- Keep dynamic values in Go data structs and pass them into templates; do not concatenate HTML strings in handlers.
- Use static bundles or a separate frontend build pipeline. This starter is the static-bundle path.

## Static Assets

- Use pre-built browser-loadable bundles when keeping the starter free of frontend build tooling.
- If serving local bundles instead, add explicit static file handling in `main.go` and point CSS and module imports at that route.
- Keep theme attributes on the root HTML template, not in Go handler code.

## Go Template Constraints

- Use escaped template output for data values.
- Only use trusted template HTML for checked Elements markup and HTMX attributes.
- Keep routing and rendering small; move repeated page shell or fragment code into templates before adding more routes.

## HTMX Constraints

- Keep fragment endpoints under `/fragment/`.
- Return only the target fragment from fragment routes.
- Keep full-page templates and fragment templates separate so fragment routes do not render the page shell.
- Keep HTMX request behavior in templates, not generated handler strings.

## Verification

- Run `pnpm run build` in `projects/starters/go-htmx` after Go or template changes.
- Run `pnpm run dev` for local rendering checks on `http://localhost:8080`.
