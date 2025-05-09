---
{
  title: 'Layers',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Layers define the position of an element on the z-axis in the UI. Layer types are categories of elements that build up to higher layers as they are stacked or nested. Read more about the [popover explainer](https://open-ui.org/components/popup.research.explainer).

The layers in order of stacking are the following:

- `canvas` - body, document
- `container` - cards, stepss, tabs
- `overlay` - modals, drawers, dropdowns (menus, filters, combobox)
- `popover` - tooltips, toasts, notifications

{% story '@nvidia-elements/themes/theme.stories.json', 'Objects' %}

{% story '@nvidia-elements/themes/theme.stories.json', 'Layers', '{ "inline": false, "height": "650px" }' %}

## Layer Tokens

### Canvas

{% tokens 'sys-layer-canvas' %}

### Shell

{% tokens 'sys-layer-shell' %}

### Container

{% tokens 'sys-layer-container' %}

### Overlay

{% tokens 'sys-layer-overlay' %}

### Popover

{% tokens 'sys-layer-popover' %}
