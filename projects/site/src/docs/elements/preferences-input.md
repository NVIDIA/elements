---
{
  title: 'Preferences Input',
  layout: 'docs.11ty.js',
  tag: 'nve-preferences-input'
}
---

## Installation

```typescript
import '@nvidia-elements/core/preferences-input/define.js';
```

```html
<nve-preferences-input name="theme" value="{ 'theme': 'dark' }"></nve-preferences-input>
```

## Standard

{% story 'nve-preferences-input', 'Default' %}

## Forms

Preferences Input is [form associated component](https://web.dev/more-capable-form-controls/#defining-a-form-associated-custom-element) and can be used within FormData.

{% story 'nve-preferences-input', 'Forms', '{ "inline": false, "height": "420px" }' %}

## Dropdown

{% story 'nve-preferences-input', 'Dropdown', '{ "inline": false, "height": "600px" }' %}
