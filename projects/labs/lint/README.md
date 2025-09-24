# @nvidia-elements/lint

The `@nvidia-elements/lint` package is a utility library that provides Elements-specific lint rules to enforce best practices and prevent common errors when using Elements.

## Getting Started

```shell
# setup artifactory registry
npm config set registry https://registry.npmjs.org

# https://registry.npmjs.org
npm login

# install package
npm install @nvidia-elements/cli
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

## Severity

Rules can individually be adjusted for lint severity. By default rules are set to `error`.

```javascript
import { elementsHtmlConfig, elementsCssConfig } from '@nvidia-elements/lint/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  elementsHtmlConfig,
  {
    ...elementsCssConfig,
    rules: {
      '@nvidia-elements/lint/no-unexpected-css-value': 'warn'
    }
  }
];
```

### Rules

| Rule | Description | Language | Severity |
| ---- | ----------- | -------- | -------- |
| `@nvidia-elements/lint/no-unexpected-css-variable` | Do not allow use of invalid CSS theme variables | CSS | `error` |
| `@nvidia-elements/lint/no-unexpected-css-value` | Do not allow use of invalid CSS value | CSS | `error` |
| `@nvidia-elements/lint/no-deprecated-tags` | Do not allow use of deprecated elements/tags | HTML | `error` |
| `@nvidia-elements/lint/no-restricted-attrs` | Do not allow invalid use of nve-* attributes | HTML | `error` |
| `@nvidia-elements/lint/no-restricted-attr-values` | Do not allow invalid nve-* attribute values | HTML | `error` |
| `@nvidia-elements/lint/no-unexpected-library-dependencies` | Disallow incorrect dependency usage of @nve packages in consuming libraries. | JSON | `error` |