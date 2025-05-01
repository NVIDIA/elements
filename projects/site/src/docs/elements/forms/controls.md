---
{
  title: 'Controls',
  layout: 'docs.11ty.js',
  tag: 'nve-control',
  permalink: 'docs/foundations/forms/controls/index.html',
  associatedElements: ['nve-control-mesage', 'nve-control-group']
}
---

## Installation

```typescript
import '@nvidia-elements/core/forms/define.js';
```

The `nve-control` element is the base control that all built in `nve-*` form controls extend. The `nve-control` can be used for generic imput type as well as custom or third party form controls.

## Responsive

All control elements are responsive and will adjust to one of the set layouts based on the available space. The element breakpoints are based on the available space to the element rather than the viewport.

{% story '@nvidia-elements/core/forms/control/control.stories.json', 'Responsive' %}

## Custom Controls

Custom inputs can be used and leverage the same form layouts and validation statuses as the built in controls.
Place the `nve-control` attribute on the element that is the custom input. [emoji picker source](https://github.com/nolanlawson/emoji-picker-element).

{% story '@nvidia-elements/core/forms/control/control.stories.json', 'Custom', '{ "inline": false, "height": "400px" }' %}
