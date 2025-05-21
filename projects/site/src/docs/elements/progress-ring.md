---
{
  title: 'Progress Ring',
  layout: 'docs.11ty.js',
  tag: 'nve-progress-ring'
}
---

## Installation

{% install 'nve-progress-ring' %}

## Standard

{% story 'nve-progress-ring', 'Default' %}

## Value

{% api 'nve-progress-ring', 'property', 'value' %}

{% story 'nve-progress-ring', 'Values' %}

## Max Value

{% api 'nve-progress-ring', 'property', 'max' %}

{% story 'nve-progress-ring', 'Max' %}

## Indicating Status

{% api 'nve-progress-ring', 'property', 'status' %}

{% story 'nve-progress-ring', 'Status' %}

When `value` is set to zero, full size status icons are shown with no ring.

{% story 'nve-progress-ring', 'ZeroValueStatus' %}

When used with text, please set `size="xs"`.

{% story 'nve-progress-ring', 'WithText' %}

## Sizing

{% api 'nve-progress-ring', 'property', 'size' %}

{% story 'nve-progress-ring', 'Sizing' %}

## Custom Icon Slotting

The `status-icon` slot can be used within `nve-progress-ring` to create a custom loading indicator.

{% story 'nve-progress-ring', 'SlottedIcon' %}

## Using within a Button

When `nve-progress-ring` is used within a `nve-button` the `status` should be set to `neutral` to properly inherit button background color.

{% story 'nve-progress-ring', 'WithButton' %}
