---
{
  title: 'Progress Ring',
  layout: 'docs.11ty.js',
  tag: 'nve-progress-ring'
}
---

## Installation

{% install 'nve-progress-ring' %}

## Value

{% api 'nve-progress-ring', 'property', 'value' %}

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'Values' %}

## Max Value

{% api 'nve-progress-ring', 'property', 'max' %}

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'Max' %}

## Indicating Status

{% api 'nve-progress-ring', 'property', 'status' %}

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'Status' %}

When `value` is set to zero, full size status icons are shown with no ring.

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'ZeroValueStatus' %}

When used with text, please set `size="xs"`.

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'WithText' %}

## Sizing

{% api 'nve-progress-ring', 'property', 'size' %}

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'Sizing' %}

## Custom Icon Slotting

The `status-icon` slot can be used within `nve-progress-ring` to create a custom loading indicator.

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'SlottedIcon' %}

## Using within a Button

When `nve-progress-ring` is used within a `nve-button` the `status` should be set to `neutral` to properly inherit button background color.

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'WithButton' %}
