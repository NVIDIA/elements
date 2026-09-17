---
{
  title: 'Viewport',
  description: 'Use the NVIDIA Elements viewport to navigate arbitrary spatial content with pan, zoom, fitting, grid lines, and programmatic controls.',
  layout: 'docs.11ty.js',
  tag: 'nve-viewport',
  associatedElements: ['nve-viewport-gridlines']
}
---

## Installation

{% install 'nve-viewport' %}

## Panning

{% api 'nve-viewport', 'property', 'behaviorPan' %}

## Zooming

{% api 'nve-viewport', 'property', 'behaviorZoom' %}

## Custom Background

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'Background' '{ "inline": false, "height": "420px" }' %}

## Interactive Content

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'InteractiveContent' '{ "inline": false, "height": "420px" }' %}

## Panning with Space

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'PanWithSpace' '{ "inline": false, "height": "420px" }' %}

## Invoker Commands

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'Commands' '{ "inline": false, "height": "420px" }' %}

## Programmatic Navigation

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'Reveal' '{ "inline": false, "height": "420px" }' %}
