# Static Bundle + @elements/elements

[Built with Vite](https://vitejs.dev/)

This starter demonstrates how to build a single JS bundle **only** for the following specific use cases:

- Simple HTML prototypes
- Non-JS build pipelines (Python, SSR)
- CMS systems
- Static Site Generators (see `typescript` demo folder as an alternative)

This approach should only be used if the application development environment does not support a Web-based build system such as Rollup, Vite, Esbuild or Webpack.

Using the single bundle approach can make simple HTML prototypes easy but prevent performance optimizations such as tree shaking. Lack of these optimizations means your users will incur a performance penalty loading all components regardless if they are used in the UI.

## Getting Started

Ensure [NodeJS](https://nodejs.org/en/) is installed in your development environment.

```bash
# install packages
npm i
```

```bash
# run local dev env
npm run dev
```

## Build Bundles

To build the global bundles, import the components desired for your bundle in the `index.html`.

```bash
# build for production
npm run build
```

Once build you will have the following in the `dist`.

```
elements.[version].bundle.js
elements.[version].bundle.css
elements.[version].bundle.woff2
elements.[version].bundle.json
```

These files can now be manually copied into your environment for use.

```html
<!doctype html>
<html lang="en" nve-theme="dark">
  <head>
    <link rel="stylesheet" href="./elements.0.0.0.bundle.css" />
  </head>
  <body nve-text="body">
    <nve-alert>hello there</nve-alert>

    <script type="module" src="./elements.0.0.0.bundle.js"></script>
  </body>
</html>
```
