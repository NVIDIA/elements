---
{
  title: 'Checkbox',
  layout: 'docs.11ty.js',
  tag: 'nve-checkbox'
}
---

## Installation

```typescript
import '@nvidia-elements/core/checkbox/define.js';
```

```html
<nve-checkbox>
  <label>label</label>
  <input type="checkbox" />
</nve-checkbox>
```

## Standard

{% story 'nve-checkbox', 'Default' %}

## Layout

{% api 'nve-checkbox-group', 'property', 'layout' %}

### Vertical Group

{% story 'nve-checkbox', 'VerticalGroup' %}

### Vertical Inline Group

{% story 'nve-checkbox', 'VerticalInlineGroup' %}

### Horizontal Group

{% story 'nve-checkbox', 'HorizontalGroup' %}

### Horizontal Inline Group

{% story 'nve-checkbox', 'HorizontalInlineGroup' %}

## Indeterminate

{% story 'nve-checkbox', 'Indeterminate' %}
