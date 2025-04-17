# @nvidia-elements/monaco

## Getting Started

```bash
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

# install core dependencies
npm install @nvidia-elements/monaco
```

```javascript
import '@nvidia-elements/monaco/editor/define.js';
```

```html
<nve-monaco-editor></nve-monaco-editor>
```

## Development

| Command          | Description                                            |
| ---------------- | ------------------------------------------------------ |
| `pnpm run build` | Build library source                                   |
| `pnpm run test`  | Run library tests                                      |
| `pnpm run ci`    | Build and run all library CI requirements (build/test) |
