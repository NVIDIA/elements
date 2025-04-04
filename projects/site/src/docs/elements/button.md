---
{
  title: 'Button',
  layout: 'docs.11ty.js',
  tag: 'nve-button'
}
---

## Installation

```typescript
import '@nvidia-elements/core/button/define.js';
```

```html
<nve-button>button</nve-button>
```

## Standard

{% story 'nve-button', 'Default' %}

## Interaction

{% api 'nve-button', 'property', 'interaction' %}

### Standard

{% story 'nve-button', 'Interaction' %}

### Flat

{% api 'nve-button', 'property', 'container' %}

{% story 'nve-button', 'Flat' %}

### Inline

{% api 'nve-button', 'property', 'container' %}

{% story 'nve-button', 'Inline' %}

## Pressed

{% api 'nve-button', 'property', 'pressed' %}

{% story 'nve-button', 'Pressed' %}

## Selected

{% api 'nve-button', 'property', 'selected' %}

{% story 'nve-button', 'SelectedFlat' %}

## Size

{% api 'nve-button', 'property', 'size' %}

{% story 'nve-button', 'Size' %}

## Linked Buttons

Anchors can wrap button instances, however its recommended to slot the anchor into the button.

```html
<nve-button><a href="#">default</a></nve-button> <!-- do -->
<a href="#"><nve-button>default</nve-button></a> <!-- don't -->
```

If you need to slot an icon in a linked button, put `nve-icon` adjacent to the anchor tag.

```html
<nve-button><a href="#">default</a> <nve-icon name="reset"></nve-icon></nve-button> <!-- do -->
```

{% story 'nve-button', 'Link' %}

{% story 'nve-button', 'LinkFlat' %}

## With Icon

{% story 'nve-button', 'ButtonWithIcon' %}

## Form Control

Form control option allows a button to be styled like a control field. This is helpful for using button to trigger custom form control components or dropdowns.

{% story 'nve-button', 'FormControl' %}
