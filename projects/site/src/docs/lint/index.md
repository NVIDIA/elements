---
{
  title: 'Elements Lint',
  layout: 'docs.11ty.js',
  hideExamplesTab: true
}
---

<nve-alert-group status="warning">
  <nve-alert>
    <nve-icon name="beaker" slot="icon" style="--color:inherit"></nve-icon> Labs projects are experimental packages available for early feedback.
  </nve-alert>
</nve-alert-group>

# Elements Lint

The `@nvidia-elements/lint` package is a utility library that provides Elements-specific lint rules to enforce best practices and prevent common errors when using Elements.

{% install-artifactory %}

```shell
# install
npm install @nvidia-elements/lint --save-dev
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

## Rules

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
