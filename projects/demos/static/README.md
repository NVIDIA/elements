# Static Bundle

[Built with Vite](https://vitejs.dev/)

This starter demonstrates how to build a single JS bundle **only** for the following specific use cases:

- Simple HTML prototypes
- Non-JS build pipelines (Python, SSR)
- CMS systems
- Static Site Generators (see `typescript` demo folder as an alternative)

This approach should only be used if the application development environment does not support a Web-based build system such as Rollup, Vite, ESBuild or Webpack.

Using the single bundle approach can make simple HTML prototypes easy but prevent performance optimizations such as tree shaking. Lack of these optimizations means your users will incur a performance penalty loading all components regardless if they are used in the UI.

## Getting Started

Ensure [NodeJS](https://nodejs.org/en/) and [pnpm](https://pnpm.io/) are installed in your development environment.

```bash
# install packages
pnpm i
```

Copy the bundles into your environment:

```html
<!DOCTYPE html>
<html lang="en" mlv-theme="dark">
  <head>
    <link rel="stylesheet" href="./elements.[version].bundle.css">
  </head>
  <body mlv-text="body">
    <mlv-alert>hello there</mlv-alert>

    <script type="module" src="./elements.[version].bundle.js"></script>
  </body>
</html>
```

## Preview Demo

```bash
# run local dev env
pnpm run preview
```
