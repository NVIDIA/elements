---
{
  title: 'Codeblock',
  layout: 'docs.11ty.js',
  tag: 'nve-code-block',
  associatedElements: ['nve-code-block-header', 'nve-code-block-footer']
}
---

## Installation

Note: import the language before the codeblock

```typescript
// only import languages that you need
import '@nvidia-elements/code/code-block/languages/bash.js';
import '@nvidia-elements/code/code-block/languages/css.js';
import '@nvidia-elements/code/code-block/languages/go.js';
import '@nvidia-elements/code/code-block/languages/html.js';
import '@nvidia-elements/code/code-block/languages/javascript.js';
import '@nvidia-elements/code/code-block/languages/json.js';
import '@nvidia-elements/code/code-block/languages/markdown.js';
import '@nvidia-elements/code/code-block/languages/python.js';
import '@nvidia-elements/code/code-block/languages/toml.js';
import '@nvidia-elements/code/code-block/languages/typescript.js';
import '@nvidia-elements/code/code-block/languages/xml.js';
import '@nvidia-elements/code/code-block/languages/yaml.js';

// import component
import '@nvidia-elements/code/code-block/define.js';
```

```html
<nve-code-block language="typescript">
function getTime(): number {
  return new Date().getTime();
}
</nve-code-block>
```

## Code

{% api 'nve-code-block', 'property', 'code' %}

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'Code' %}

## Container

{% api 'nve-code-block', 'property', 'container' %}

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'Flat' %}

## Theme

You can set a Theme independent of the global theme using the `nve-theme` attribute.

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'Theme' %}

## Line Numbers

{% api 'nve-code-block', 'property', 'lineNumbers' %}

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'LineNumbers' %}

## Highlight

{% api 'nve-code-block', 'property', 'highlight' %}

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'Highlight' %}

## Overflow

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'Overflow' %}

## Line Wrap

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'LineWrap' %}

## Header and Footer

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'HeaderFooter' %}
