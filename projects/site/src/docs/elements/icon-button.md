---
{
  title: 'Icon Button',
  layout: 'docs.11ty.js',
  tag: 'nve-icon-button'
}
---

## Installation

{% install 'nve-icon-button' %}

## Standard

{% story 'nve-icon-button', 'Default' %}

## Interactions

{% story 'nve-icon-button', 'Interactions' %}

## Flat Interactions

{% story 'nve-icon-button', 'FlatInteractions' %}

## Pressed/Toggle

{% api 'nve-icon-button', 'property', 'pressed' %}

{% story 'nve-icon-button', 'Pressed' %}

### Pressed Flat

{% story 'nve-icon-button', 'PressedFlat' %}

### Pressed Inline

{% story 'nve-icon-button', 'PressedInline' %}

## Selected

{% api 'nve-icon-button', 'property', 'selected' %}

{% story 'nve-icon-button', 'Selected' %}

### Selected Flat

{% story 'nve-icon-button', 'SelectedFlat' %}

### Selected Inline

{% story 'nve-icon-button', 'SelectedInline' %}

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

{% story 'nve-icon-button', 'Link' %}

## Custom Icon

{% story 'nve-icon-button', 'CustomIcon' %}

## Themes

{% story 'nve-icon-button', 'Themes' %}

## Size

{% story 'nve-icon-button', 'Size' %}
