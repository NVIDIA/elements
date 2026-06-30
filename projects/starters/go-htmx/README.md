# NVIDIA Elements + HTMX + Go Starter

An interactive HTMX and Go starter for the [NVIDIA Elements design system](https://nvidia.github.io/elements/).

This starter shows a minimal Go web server using Elements and HTMX. The server uses `html/template`, pre-built Elements bundles, and one fragment endpoint that returns only the HTMX swap target.

## Getting started

```shell
go run main.go
```

Open `http://localhost:8080/` to view the application.

## Commands

- `npm run dev`: Run the local server.
- `npm run build`: Build the server binary in `bin`.
- `npm run preview`: Build and run the server binary.

## Static Assets

This starter loads Elements and HTMX from CDN URLs to avoid a frontend build pipeline. If you want to use static assets instead, serve the same bundle files from the npm packages and update the `<link>` and `<script>` URLs in `src/index.html` to point at those assets.

## Advanced Usage

This starter does not include a frontend build pipeline. If you need TypeScript, tree-shaking, or other JavaScript ecosystem tooling, use a build tool such as [Vite](https://vite.dev/) with [Vite Go](https://olivere.github.io/vite/).
