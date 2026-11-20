---
{
  title: 'Code Block',
  layout: 'docs.11ty.js',
  tag: 'nve-code-block',
  associatedElements: ['nve-code-block-header', 'nve-code-block-footer']
}
---

## Installation

Import the languages you need before defining the component. The code block displays unregistered languages as plain text.

```typescript
// only import languages that you need
import '@nvidia-elements/code/languages/css.js';
import '@nvidia-elements/code/languages/go.js';
import '@nvidia-elements/code/languages/html.js';
import '@nvidia-elements/code/languages/javascript.js';
import '@nvidia-elements/code/languages/json.js';
import '@nvidia-elements/code/languages/markdown.js';
import '@nvidia-elements/code/languages/python.js';
import '@nvidia-elements/code/languages/tsx.js';
import '@nvidia-elements/code/languages/typescript.js';
import '@nvidia-elements/code/languages/xml.js';
import '@nvidia-elements/code/languages/yaml.js';

// import component
import '@nvidia-elements/code/code-block/define.js';
```

```html
<nve-code-block language="typescript">
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;

export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
</nve-code-block>
```

## Embedded Languages

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'EmbeddedLanguages' %}

## Bracket Pair Coloring

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'BracketColoring' %}

## Theme

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'Theme' %}

## Header and Footer

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'HeaderFooter' %}

## Flat

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'Flat' %}

## Line Numbers

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'LineNumbers' %}

## Highlight

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'Highlight' %}

## Code

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'Code' %}

## Overflow and Line Wrap

{% example '@nvidia-elements/code/code-block/code-block.examples.json', 'LineWrap' %}
