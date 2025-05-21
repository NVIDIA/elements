---
{
  title: 'Select',
  layout: 'docs.11ty.js',
  tag: 'nve-select'
}
---

## Installation

{% install 'nve-select' %}

## Standard

{% story 'nve-select', 'Default' %}

## Multiple

The multiple option behavior preserves the native select value behavior. The `value` on the select
will only reflect the first selected value. To get all selected options check the `selected` property
on each `<option>` element or the select property `selectedOptions`.

{% story 'nve-select', 'Multiple' %}

If the multiple tags overflow the parent container a simple text label will be shown instead.

{% story 'nve-select', 'MultipleOverflow' %}

## Flat

{% story 'nve-select', 'Flat' %}

## Layout

{% api 'nve-select', 'property', 'layout' %}

### Vertical

{% story 'nve-select', 'Vertical' %}

### Horizontal

{% story 'nve-select', 'Horizontal' %}

## Placeholder

{% story 'nve-select', 'Placeholder' %}

{% story 'nve-select', 'PlaceholderMultiple' %}

## Disabled

{% story 'nve-select', 'Disabled' %}

## Height

Determines the scroll height of selection in open dropdown.

{% story 'nve-select', 'Height' %}

## Size

Enables [size](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/size) attribute on the select element.
This creates a inline selection at the defined item height.

{% story 'nve-select', 'Size' %}

## Prefix

{% story 'nve-select', 'Prefix' %}

## Fit Content

{% api 'nve-select', 'property', 'fitContent' %}

{% story 'nve-select', 'FitContent' %}

## Fit Text

{% api 'nve-select', 'property', 'fitText' %}

{% story 'nve-select', 'FitText' %}

## Performance

{% story 'nve-select', 'Performance' %}
