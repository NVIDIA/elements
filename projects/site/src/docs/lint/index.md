---
{
  title: 'NVIDIA Elements Lint',
  description: 'ESLint rules for NVIDIA Elements: catch missing slots, unknown attributes, deprecated tags, and other authoring mistakes at lint time.',
  layout: 'docs.11ty.js'
}
---

# {{title}}

<h2 nve-text="heading sm muted">The @nvidia-elements/lint package is a utility library that provides Elements-specific lint rules to enforce best practices and prevent common errors when using Elements</h2>

The HTML configuration checks HTML in `src/**/*.html`, supported JavaScript and TypeScript templates, and Markdown files under `src/**/*.md`. Markdown linting includes rendered markup and HTML examples in fenced code blocks.

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

You can adjust rules individually for lint severity. The rules table lists the default severity for each rule.

```javascript
import { elementsHtmlConfig, elementsCssConfig } from '@nvidia-elements/lint/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  elementsHtmlConfig,
  {
    ...elementsCssConfig,
    rules: {
      ...elementsCssConfig.rules,
      '@nvidia-elements/lint/no-unexpected-css-value': 'warn'
    }
  }
];
```

## Rules

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="400px">Rule</nve-grid-column>
    <nve-grid-column width="350px">Description</nve-grid-column>
    <nve-grid-column>Language</nve-grid-column>
    <nve-grid-column>Severity</nve-grid-column>
  </nve-grid-header>
  {% for rule in lintRules %}
  <nve-grid-row>
    <nve-grid-cell><a href="{{ rule.path | escape }}"><code nve-text="link">{{ rule.ruleId | escape }}</code></a></nve-grid-cell>
    <nve-grid-cell>{{ rule.description | escape }}</nve-grid-cell>
    <nve-grid-cell>{{ rule.languageLabel | escape }}</nve-grid-cell>
    <nve-grid-cell><code nve-text="code">{{ rule.severityLabel | escape }}</code></nve-grid-cell>
  </nve-grid-row>
  {% endfor %}
</nve-grid>
