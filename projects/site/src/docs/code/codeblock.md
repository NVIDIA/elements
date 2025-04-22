---
{
  title: 'Codeblock',
  layout: 'docs.11ty.js',
  tag: 'nve-codeblock'
}
---

## Installation

Note: language must be imported before codeblock

```typescript
// only import languages that you need
import '@nvidia-elements/code/codeblock/languages/css.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/languages/javascript.js';
import '@nvidia-elements/code/codeblock/languages/json.js';
import '@nvidia-elements/code/codeblock/languages/markdown.js';
import '@nvidia-elements/code/codeblock/languages/typescript.js';
import '@nvidia-elements/code/codeblock/languages/xml.js';

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

## Default

{% story 'nve-codeblock', 'Default' %}

## Code

{% api 'nve-codeblock', 'property', 'code' %}

{% story 'nve-codeblock', 'Code' %}

## Container

{% api 'nve-codeblock', 'property', 'container' %}

{% story 'nve-codeblock', 'Flat' %}

## Theme

A Theme can be set independant of the global theme using the `nve-theme` attribute.

{% story 'nve-codeblock', 'Theme' %}

## Line Numbers

{% api 'nve-codeblock', 'property', 'lineNumbers' %}

{% story 'nve-codeblock', 'LineNumbers' %}

## Highlight

{% api 'nve-codeblock', 'property', 'highlight' %}

{% story 'nve-codeblock', 'Highlight' %}

## Overflow

{% story 'nve-codeblock', 'Overflow' %}
