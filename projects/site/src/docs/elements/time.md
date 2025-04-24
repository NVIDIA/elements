---
{
  title: 'Time',
  layout: 'docs.11ty.js',
  tag: 'nve-time'
}
---

## Installation

```typescript
import '@nvidia-elements/core/time/define.js';
```

```html
<nve-time>
  <label>label</label>
  <input type="time" min="09:00" max="18:00" value="12:00" />
  <nve-control-message>message</nve-control-message>
</nve-time>
```

## Standard

{% story 'nve-time', 'Default' %}

## Datalist

{% story 'nve-time', 'Datalist' %}

## Layout

{% api 'nve-time', 'property', 'layout' %}

### Vertical

{% story 'nve-time', 'Vertical' %}

### Horizontal

{% story 'nve-time', 'Horizontal' %}
