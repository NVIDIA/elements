# @nvidia-elements/code

[Built with Vite](https://vitejs.dev/)

To create reusable UI components that build on top of Elements we recommend using [lit.dev](https://lit.dev) for authoring highly reusable custom elements (Web Components). This path enables your extensions to work in a large variety of frameworks and environments. We recommend reading the [publishing and best practices](https://lit.dev/docs/tools/publishing/) provided by the lit team. The rest of this guide will focus on how to integrate specifically for Element integration and best practices.

## Getting Started

```bash
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

# install core dependencies
npm install @nvidia-elements/code
```

```javascript
// import only languages needed
import '@nvidia-elements/code/codeblock/languages/css.js';
import '@nvidia-elements/code/codeblock/languages/go.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/languages/javascript.js';
import '@nvidia-elements/code/codeblock/languages/json.js';
import '@nvidia-elements/code/codeblock/languages/markdown.js';
import '@nvidia-elements/code/codeblock/languages/python.js';
import '@nvidia-elements/code/codeblock/languages/typescript.js';
import '@nvidia-elements/code/codeblock/languages/xml.js';
import '@nvidia-elements/code/codeblock/languages/yaml.js';

// import codeblock component
import '@nvidia-elements/code/codeblock/define.js';
```

```html
<nve-codeblock language="typescript">
  <template>
    console.log('hello there')
  </template>
</nve-codeblock>
```

## Development

| Command          | Description                                            |
| ---------------- | ------------------------------------------------------ |
| `pnpm run build` | Build library source                                   |
| `pnpm run test`  | Run library tests                                      |
| `pnpm run ci`    | Build and run all library CI requirements (build/test) |
