---
{
  title: 'Progress Bar',
  layout: 'docs.11ty.js',
  tag: 'nve-progress-bar'
}
---

## Installation

{% install 'nve-progress-bar' %}

## Setting the Value

{% api 'nve-progress-bar', 'property', 'value' %}

```html
<nve-progress-bar status="accent" value="25"></nve-progress-bar>

<nve-progress-bar status="success" value="50"></nve-progress-bar>

<nve-progress-bar status="warning" value="75"></nve-progress-bar>

<nve-progress-bar status="danger" value="100"></nve-progress-bar>
```

## Standard

{% story 'nve-progress-bar', 'Default' %}

## Max Value

{% api 'nve-progress-bar', 'property', 'max' %}

{% story 'nve-progress-bar', 'Max' %}

## Label Display

Progress bars may have their labels and numerical values displayed above its visual indicator.

{% story 'nve-progress-bar', 'Labeled' %}

## Indeterminate Animation (Horizontal Loading Indicator)

Progress bars may will display as an animated loading indicator when no `value` attribute is set.

Leave off the `status` attribute for the `neutral` color.

{% story 'nve-progress-bar', 'Indeterminate' %}

Or in combination with `status` colors.

{% story 'nve-progress-bar', 'IndeterminateStatusColors' %}

Alternatively, set the `--accent-color` css property for a branded progress bar style.

{% story 'nve-progress-bar', 'IndeterminateCustomColor' %}
