---
{
  title: 'Radio',
  layout: 'docs.11ty.js',
  tag: 'nve-radio'
}
---

## Installation

```typescript
import '@nvidia-elements/core/radio/define.js';
```

```html
<nve-radio-group>
  <label>label</label>
  <nve-radio>
    <label>radio 1</label>
    <input type="radio" checked />
  </nve-radio>

  <nve-radio>
    <label>radio 2</label>
    <input type="radio" />
  </nve-radio>

  <nve-radio>
    <label>radio 3</label>
    <input type="radio" />
  </nve-radio>
  <nve-control-message>message</nve-control-message>
</nve-radio-group>
```

## Standard

{% story 'nve-radio', 'Default' %}

## Layout

{% api 'nve-checkbox-group', 'property', 'layout' %}

### Vertical Group

{% story 'nve-radio', 'VerticalGroup' %}

### Vertical Inline Group

{% story 'nve-radio', 'VerticalInlineGroup' %}

### Horizontal Group

{% story 'nve-radio', 'HorizontalGroup' %}

### Horizontal Inline Group

{% story 'nve-radio', 'HorizontalInlineGroup' %}
