---
{
  title: 'Logo',
  layout: 'docs.11ty.js',
  tag: 'nve-logo'
}
---

## Installation

{% install 'nve-logo' %}

## Size

{% api 'nve-logo', 'property', 'size' %}

{% example '@nvidia-elements/core/logo/logo.examples.json' 'Size' %}

## Color

{% api 'nve-logo', 'property', 'color' %}

{% example '@nvidia-elements/core/logo/logo.examples.json' 'Color' %}

## Slotted Icon

Slotted icon in logo will inherit logo color and size

{% example '@nvidia-elements/core/logo/logo.examples.json' 'SlottedIcons' %}
