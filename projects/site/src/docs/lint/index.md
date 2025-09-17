---
{
  title: 'Elements Lint',
  layout: 'docs.11ty.js',
  hideExamplesTab: true
}
---

# Elements Lint

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

<nve-grid>
  <nve-grid-header>
    <nve-grid-column>Rule</nve-grid-column>
    <nve-grid-column>Description</nve-grid-column>
    <nve-grid-column>Language</nve-grid-column>
    <nve-grid-column>Severity</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">@nvidia-elements/lint/no-unexpected-css-variable</code></nve-grid-cell>
    <nve-grid-cell>Do not allow use of invalid CSS theme variables</nve-grid-cell>
    <nve-grid-cell>CSS</nve-grid-cell>
    <nve-grid-cell><code nve-text="code">error</code></nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">@nvidia-elements/lint/no-unexpected-css-value</code></nve-grid-cell>
    <nve-grid-cell>Do not allow use of invalid CSS value</nve-grid-cell>
    <nve-grid-cell>CSS</nve-grid-cell>
    <nve-grid-cell><code nve-text="code">error</code></nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">@nvidia-elements/lint/no-deprecated-tags</code></nve-grid-cell>
    <nve-grid-cell>Do not allow use of deprecated elements/tags</nve-grid-cell>
    <nve-grid-cell>HTML</nve-grid-cell>
    <nve-grid-cell><code nve-text="code">error</code></nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">@nvidia-elements/lint/no-restricted-attrs</code></nve-grid-cell>
    <nve-grid-cell>Do not allow invalid use of nve-* attributes</nve-grid-cell>
    <nve-grid-cell>HTML</nve-grid-cell>
    <nve-grid-cell><code nve-text="code">error</code></nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">@nvidia-elements/lint/no-restricted-attr-values</code></nve-grid-cell>
    <nve-grid-cell>Do not allow invalid nve-* attribute values</nve-grid-cell>
    <nve-grid-cell>HTML</nve-grid-cell>
    <nve-grid-cell><code nve-text="code">error</code></nve-grid-cell>
  </nve-grid-row>
</nve-grid>
