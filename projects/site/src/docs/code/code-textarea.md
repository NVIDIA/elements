---
{
  title: 'Code Textarea',
  description: 'Edit syntax-highlighted source code in a native textarea with standard form behavior.',
  layout: 'docs.11ty.js',
  tag: 'nve-code-textarea'
}
---

<nve-alert-group status="warning">
  <nve-alert style="--align-items: start">
    <div nve-layout="pad:xs" nve-text="relaxed">Syntax highlighting a textarea requires browser support for <code nve-text="code">OpaqueRange</code>. Editing and form submission still work without it. See the <a href="https://open-ui.org/components/richer-text-fields.explainer/">Open UI explainer</a>.</div>
  </nve-alert>
</nve-alert-group>

## Installation

Note: Import the languages you need before defining the component.

```typescript
import '@nvidia-elements/code/languages/typescript.js';
import '@nvidia-elements/code/code-textarea/define.js';
```

## Embedded Languages

{% example '@nvidia-elements/code/code-textarea/code-textarea.examples.json', 'EmbeddedLanguages' %}

## Bracket Pair Coloring

{% example '@nvidia-elements/code/code-textarea/code-textarea.examples.json', 'BracketColoring' %}

## Flat

{% example '@nvidia-elements/code/code-textarea/code-textarea.examples.json', 'Flat' %}

## Form

{% example '@nvidia-elements/code/code-textarea/code-textarea.examples.json', 'Form' %}
