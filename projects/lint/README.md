# @nvidia-elements/lint

The `@nvidia-elements/lint` package is a utility library that provides Elements-specific lint rules to enforce best practices and prevent common errors when using Elements.

- [Documentation](https://NVIDIA.github.io/elements/docs/lint/)
- [Slack Support](https://nvidia.slack.com/archives/C03BDL2UCGK)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [GitHub Repo](https://github.com/NVIDIA/elements)
- [NPM](https://registry.npmjs.org

## Getting Started

```shell
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

npm install @nvidia-elements/lint
```

## Usage

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

You can individually adjust rules for lint severity. By default rules use `error` severity.

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
| `@nvidia-elements/lint/no-complex-popovers` | Disallow excessive DOM complexity inside popover elements. | HTML | `error` |
| `@nvidia-elements/lint/no-deprecated-attributes` | Disallow use of deprecated attributes in HTML. | HTML | `error` |
| `@nvidia-elements/lint/no-deprecated-css-imports` | Disallow use of deprecated CSS import paths. | CSS | `error` |
| `@nvidia-elements/lint/no-deprecated-css-variable` | Disallow use of deprecated --nve-* CSS theme variables. | CSS | `error` |
| `@nvidia-elements/lint/no-deprecated-global-attributes` | Disallow use of deprecated global utility attributes in HTML. | HTML | `error` |
| `@nvidia-elements/lint/no-deprecated-icon-names` | Disallow use of deprecated icon names. | HTML | `error` |
| `@nvidia-elements/lint/no-deprecated-packages` | Disallow usage of deprecated packages. | JSON | `error` |
| `@nvidia-elements/lint/no-deprecated-popover-attributes` | Disallow use of deprecated popover attributes. | HTML | `error` |
| `@nvidia-elements/lint/no-deprecated-slots` | Disallow use of deprecated slot APIs. | HTML | `error` |
| `@nvidia-elements/lint/no-deprecated-tags` | Disallow use of deprecated elements in HTML. | HTML | `error` |
| `@nvidia-elements/lint/no-invalid-event-listeners` | Disallow inline event handler attributes in HTML. | HTML | `error` |
| `@nvidia-elements/lint/no-invalid-invoker-triggers` | Disallow use of invoker trigger attributes on non-button nve-* elements. | HTML | `error` |
| `@nvidia-elements/lint/no-missing-control-label` | Require form controls to have an accessible label. | HTML | `error` |
| `@nvidia-elements/lint/no-missing-gap-space` | Require gap spacing on row and column layouts. | HTML | `off` |
| `@nvidia-elements/lint/no-missing-icon-name` | Require icon elements to have an icon name attribute. | HTML | `error` |
| `@nvidia-elements/lint/no-missing-popover-trigger` | Require popover elements to have a corresponding trigger element. | HTML | `error` |
| `@nvidia-elements/lint/no-missing-slotted-elements` | Disallow use of missing slotted elements. | HTML | `error` |
| `@nvidia-elements/lint/no-nested-container-types` | Require nested container components to use flat container mode. | HTML | `error` |
| `@nvidia-elements/lint/no-restricted-attributes` | Disallow use of invalid API attributes or utility attributes on custom HTML element tags. | HTML | `error` |
| `@nvidia-elements/lint/no-restricted-page-sizing` | Disallow custom height or width styles on nve-page. | HTML | `error` |
| `@nvidia-elements/lint/no-unexpected-attribute-value` | Disallow use of invalid attribute values for nve-* elements. | HTML | `error` |
| `@nvidia-elements/lint/no-unexpected-css-value` | Disallow use of invalid CSS values. | CSS | `error` |
| `@nvidia-elements/lint/no-unexpected-css-variable` | Disallow use of invalid CSS theme variables. | CSS | `error` |
| `@nvidia-elements/lint/no-unexpected-global-attribute-value` | Disallow use of invalid attribute values in HTML. | HTML | `error` |
| `@nvidia-elements/lint/no-unexpected-input-type` | Disallow slotted input elements with a type that does not match the parent Elements component. | HTML | `error` |
| `@nvidia-elements/lint/no-unexpected-library-dependencies` | Disallow incorrect dependency usage of @nve packages in consuming libraries. | JSON | `error` |
| `@nvidia-elements/lint/no-unexpected-slot-value` | Disallow use of invalid slot values in HTML. | HTML | `error` |
| `@nvidia-elements/lint/no-unexpected-style-customization` | Disallow use of style customization in Elements playground template. | HTML | `off` |
| `@nvidia-elements/lint/no-unknown-css-variable` | Disallow use of unknown --nve-* CSS theme variables. | CSS | `error` |
| `@nvidia-elements/lint/no-unknown-tags` | Disallow use of unknown nve-* tags. | HTML | `error` |
| `@nvidia-elements/lint/no-unstyled-typography` | Require typography elements to have nve-text styling applied. | HTML | `error` |
