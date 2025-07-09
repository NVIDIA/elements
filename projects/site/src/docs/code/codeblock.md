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

{% story '@nvidia-elements/code/codeblock/codeblock.stories.json', 'Default' %}

## Code

{% api 'nve-codeblock', 'property', 'code' %}

{% story '@nvidia-elements/code/codeblock/codeblock.stories.json', 'Code' %}

## Container

{% api 'nve-codeblock', 'property', 'container' %}

{% story '@nvidia-elements/code/codeblock/codeblock.stories.json', 'Flat' %}

## Theme

A Theme can be set independant of the global theme using the `nve-theme` attribute.

{% story '@nvidia-elements/code/codeblock/codeblock.stories.json', 'Theme' %}

## Line Numbers

{% api 'nve-codeblock', 'property', 'lineNumbers' %}

{% story '@nvidia-elements/code/codeblock/codeblock.stories.json', 'LineNumbers' %}

## Highlight

{% api 'nve-codeblock', 'property', 'highlight' %}

{% story '@nvidia-elements/code/codeblock/codeblock.stories.json', 'Highlight' %}

## Overflow

{% story '@nvidia-elements/code/codeblock/codeblock.stories.json', 'Overflow' %}
