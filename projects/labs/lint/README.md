# @nvidia-elements/lint

Utility library for Elements specific lint rules.

## Getting Started

```shell
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
pnpm login

# install
pnpm install @nvidia-elements/lint
```

## ESLint

To apply the default recommended configs import `elementsRecommended`.

```javascript
// eslint.config.js
import { elementsRecommended } from '@nvidia-elements/lint/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended
];
```

Or optionally import language specific configurations.

```javascript
// eslint.config.js
import { elementsHtmlConfig, elementsCssConfig } from '@nvidia-elements/lint/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  elementsHtmlConfig,
  elementsCssConfig
];
```

```shell
eslint -c ./eslint.config.js --color
```

### Rules

| Rule | Description | Language | Severity |
| ---- | ----------- | -------- | -------- |
| `@nvidia-elements/lint/no-unexpected-css-variable` | Do not allow use of invalid CSS theme variables | CSS | `error` |
| `@nvidia-elements/lint/no-unexpected-css-value` | Do not allow use of invalid CSS value | CSS | `error` |
| `@nvidia-elements/lint/no-deprecated-tags` | Do not allow use of deprecated elements/tags | HTML | `error` |
| `@nvidia-elements/lint/no-restricted-attrs` | Do not allow invalid use of nve-* attributes | HTML | `error` |
| `@nvidia-elements/lint/no-restricted-attr-values` | Do not allow invalid nve-* attribute values | HTML | `error` |