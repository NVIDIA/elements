---
{
  title: 'Code Textarea',
  description: 'Edit syntax-highlighted source code in a native textarea with standard form behavior.',
  layout: 'docs.11ty.js',
  tag: 'nve-code-textarea'
}
---

## Installation

Note: Import the languages you need before defining the component.

```typescript
import '@nvidia-elements/code/codeblock/languages/typescript.js';
import '@nvidia-elements/code/code-textarea/define.js';
```

## Form

{% example '@nvidia-elements/code/code-textarea/code-textarea.examples.json', 'Form' %}

## Embedded Languages

{% example '@nvidia-elements/code/code-textarea/code-textarea.examples.json', 'Markdown' %}
