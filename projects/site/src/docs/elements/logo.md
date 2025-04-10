---
{
  title: 'Logo',
  layout: 'docs.11ty.js',
  tag: 'nve-logo'
}
---

## Installation

```typescript
import '@nvidia-elements/core/logo/define.js';
```

```html
<nve-logo></nve-logo>
```

## Standard

{% story 'nve-logo', 'Default' %}

## Size

{% api 'nve-logo', 'property', 'size' %}

{% story 'nve-logo', 'Size' %}

## Color

{% api 'nve-logo', 'property', 'color' %}

{% story 'nve-logo', 'Color' %}

## Slotted Icon

Slotted icon in logo will inherit logo color and size

{% story 'nve-logo', 'SlottedIcons' %}
