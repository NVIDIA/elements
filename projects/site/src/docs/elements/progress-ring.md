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

When used with text, please set `size="xs"`.

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'WithText' %}

## Sizing

{% api 'nve-progress-ring', 'property', 'size' %}

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'Sizing' %}

## Custom Icon Slotting

The `status-icon` slot within `nve-progress-ring` creates a custom loading indicator.

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'SlottedIcon' %}

## Using within a Button

When using `nve-progress-ring` within a `nve-button`, set the `status` to `neutral` to properly inherit button background color.

{% example '@nvidia-elements/core/progress-ring/progress-ring.examples.json' 'WithButton' %}
