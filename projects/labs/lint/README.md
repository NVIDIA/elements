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
| `@nvidia-elements/lint/no-unexpected-css-variable` | Disallow use of invalid CSS theme variables | CSS | `error` |
| `@nvidia-elements/lint/no-unexpected-css-value` | Disallow use of invalid CSS value | CSS | `error` |
| `@nvidia-elements/lint/no-unknown-css-variable` | Disallow use of unknown --nve-* CSS theme variables. | CSS | `error` |
| `@nvidia-elements/lint/no-deprecated-css-variable` | Disallow use of deprecated --mlv-* CSS theme variables. | CSS | `error` |
| `@nvidia-elements/lint/no-deprecated-attributes` | Disallow use of deprecated attributes in HTML | HTML | `error` |
| `@nvidia-elements/lint/no-deprecated-icon-names` | Disallow use of deprecated icon names | HTML | `error` |
| `@nvidia-elements/lint/no-deprecated-popover-attributes` | Disallow use of deprecated popover attributes | HTML | `error` |
| `@nvidia-elements/lint/no-deprecated-tags` | Disallow use of deprecated elements/tags | HTML | `error` |
| `@nvidia-elements/lint/no-unexpected-global-attribute-value` | Disallow use of invalid attribute values in HTML | HTML | `error` |
| `@nvidia-elements/lint/no-restricted-attrs` | Do not allow invalid use of nve-* attributes | HTML | `error` |
| `@nvidia-elements/lint/no-unexpected-library-dependencies` | Disallow incorrect dependency usage of @nve packages in consuming libraries | JSON | `error` |
| `@nvidia-elements/lint/no-deprecated-packages` | Disallow usage of deprecated packages. | JSON | `error` |