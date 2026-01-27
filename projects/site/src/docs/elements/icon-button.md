---
{
  title: 'Icon Button',
  layout: 'docs.11ty.js',
  tag: 'nve-icon-button'
}
---

## Installation

{% install 'nve-icon-button' %}

## Interactions

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'Interactions' %}

## Flat Interactions

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'FlatInteractions' %}

## Pressed/Toggle

{% api 'nve-icon-button', 'property', 'pressed' %}

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'Pressed' %}

### Pressed Flat

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'PressedFlat' %}

### Pressed Inline

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'PressedInline' %}

## Selected

{% api 'nve-icon-button', 'property', 'selected' %}

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'Selected' %}

### Selected Flat

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'SelectedFlat' %}

### Selected Inline

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'SelectedInline' %}

## Link

Anchors can wrap button instances, however its recommended to slot the anchor into the button.

```html
<!-- do -->
<nve-icon-button icon-name="menu">
    <a href="#" aria-label="link to page"></a>
</nve-icon-button>

<!-- don't -->
<a href="#" aria-label="link to page">
    <nve-icon-button container="flat" icon-name="menu"></nve-icon-button>
</a>
```

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'Link' %}

## Custom Icon

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'CustomIcon' %}

## Themes

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'Themes' %}

## Size

{% example '@nvidia-elements/core/icon-button/icon-button.examples.json' 'Size' %}
