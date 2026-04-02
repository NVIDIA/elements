# @nvidia-elements/code

Syntax-highlighted code block components supporting many programming languages.

- [Documentation](https://NVIDIA.github.io/elements/docs/code/)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [GitHub Repo](https://github.com/NVIDIA/elements)
- [NPM](https://registry.npmjs.org

## Getting Started

```bash
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

npm install @nvidia-elements/code
```

## Usage

```javascript
// import only languages needed
import '@nvidia-elements/code/codeblock/languages/bash.js';
import '@nvidia-elements/code/codeblock/languages/css.js';
import '@nvidia-elements/code/codeblock/languages/go.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/languages/javascript.js';
import '@nvidia-elements/code/codeblock/languages/json.js';
import '@nvidia-elements/code/codeblock/languages/markdown.js';
import '@nvidia-elements/code/codeblock/languages/python.js';
import '@nvidia-elements/code/codeblock/languages/toml.js';
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
