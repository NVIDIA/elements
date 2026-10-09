---
{
  title: 'Gridlines',
  description: 'Add lines, dots, or crosses behind NVIDIA Elements viewport content.',
  layout: 'docs.11ty.js',
  tag: 'nve-viewport-gridlines'
}
---

## Installation

{% install 'nve-viewport-gridlines' %}

## Grid Spacing

{% api 'nve-viewport-gridlines', 'property', 'step' %}

{% api 'nve-viewport-gridlines', 'property', 'targetSpacing' %}

## Dot Grid

{% example '@nvidia-elements/viewport/gridlines/gridlines.examples.json' 'Dots' '{ "inline": false, "height": "420px" }' %}

## Cross Grid

{% example '@nvidia-elements/viewport/gridlines/gridlines.examples.json' 'Crosses' '{ "inline": false, "height": "420px" }' %}
