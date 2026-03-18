---
{
  title: 'Control Actions',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Text type controls support prefix and suffix labeling as well as action buttons.

## Installation

```typescript
import '@nvidia-elements/core/input/define.js';
```

```html
<nve-input>
  <label>label</label>
  <input type="text" />
  <nve-icon-button icon-name="cancel" container="flat" aria-label="clear"></nve-icon-button>
</nve-input>
```

## Actions

{% example '@nvidia-elements/core/forms/actions.examples.json', 'SearchClear' %}

## Label Action

{% example '@nvidia-elements/core/forms/actions.examples.json', 'LabelAction' %}

## Prefix/Suffix

{% example '@nvidia-elements/core/forms/actions.examples.json', 'PrefixSuffix' %}
