---
{
  title: 'Select',
  layout: 'docs.11ty.js',
  tag: 'nve-select'
}
---

## Installation

{% install 'nve-select' %}

## Multiple

The multiple option behavior preserves the native select value behavior. The `value` on the select
will only reflect the first selected value. To get all selected options check the `selected` property
on each `<option>` element or the select property `selectedOptions`.

{% example '@nvidia-elements/core/select/select.examples.json' 'Multiple' %}

If the multiple tags overflow the parent container a simple text label will be shown instead.

{% example '@nvidia-elements/core/select/select.examples.json' 'MultipleOverflow' %}

## Flat

{% example '@nvidia-elements/core/select/select.examples.json' 'Flat' %}

## Layout

{% api 'nve-select', 'property', 'layout' %}

### Vertical

{% example '@nvidia-elements/core/select/select.examples.json' 'Vertical' %}

### Horizontal

{% example '@nvidia-elements/core/select/select.examples.json' 'Horizontal' %}

## Placeholder

{% example '@nvidia-elements/core/select/select.examples.json' 'Placeholder' %}

{% example '@nvidia-elements/core/select/select.examples.json' 'PlaceholderMultiple' %}

## Disabled

{% example '@nvidia-elements/core/select/select.examples.json' 'Disabled' %}

## Height

Determines the scroll height of selection in open dropdown.

{% example '@nvidia-elements/core/select/select.examples.json' 'Height' %}

## Size

Enables [size](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/size) attribute on the select element.
This creates a inline selection at the defined item height.

{% example '@nvidia-elements/core/select/select.examples.json' 'Size' %}

## Prefix

{% example '@nvidia-elements/core/select/select.examples.json' 'Prefix' %}

## Fit Content

{% api 'nve-select', 'property', 'fitContent' %}

{% example '@nvidia-elements/core/select/select.examples.json' 'FitContent' %}

## Fit Text

{% api 'nve-select', 'property', 'fitText' %}

{% example '@nvidia-elements/core/select/select.examples.json' 'FitText' %}

## Performance

{% example '@nvidia-elements/core/select/select.examples.json' 'Performance' %}
