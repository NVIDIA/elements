---
{
  title: 'Control Actions',
  layout: 'docs.11ty.js',
  permalink: 'docs/foundations/forms/actions/index.html'
}
---

# Control Actions

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

{% story '@nvidia-elements/core/forms/actions.stories.json', 'Actions' %}

## Label Action

{% story '@nvidia-elements/core/forms/actions.stories.json', 'LabelAction' %}

## Prefix/Suffix

{% story '@nvidia-elements/core/forms/actions.stories.json', 'PrefixSuffix' %}
