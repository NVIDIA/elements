---
{
  title: 'Codeblock',
  layout: 'docs.11ty.js',
  tag: 'nve-codeblock',
  hideExamplesTab: true
}
---

## Installation

Note: language must be imported before codeblock

```typescript
// only import languages that you need
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

// import component
import '@nvidia-elements/code/codeblock/define.js';
```

```html
<nve-codeblock language="typescript">
function getTime(): number {
  return new Date().getTime();
}
</nve-codeblock>
```

## Code

{% api 'nve-codeblock', 'property', 'code' %}

{% example '@nvidia-elements/code/codeblock/codeblock.examples.json', 'Code' %}

## Container

{% api 'nve-codeblock', 'property', 'container' %}

{% example '@nvidia-elements/code/codeblock/codeblock.examples.json', 'Flat' %}

## Theme

A Theme can be set independent of the global theme using the `nve-theme` attribute.

{% example '@nvidia-elements/code/codeblock/codeblock.examples.json', 'Theme' %}

## Line Numbers

{% api 'nve-codeblock', 'property', 'lineNumbers' %}

{% example '@nvidia-elements/code/codeblock/codeblock.examples.json', 'LineNumbers' %}

## Highlight

{% api 'nve-codeblock', 'property', 'highlight' %}

{% example '@nvidia-elements/code/codeblock/codeblock.examples.json', 'Highlight' %}

## Overflow

{% example '@nvidia-elements/code/codeblock/codeblock.examples.json', 'Overflow' %}

## Line Wrap

{% example '@nvidia-elements/code/codeblock/codeblock.examples.json', 'LineWrap' %}
