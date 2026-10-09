---
{
  title: 'Viewport',
  description: 'Use the NVIDIA Elements viewport to navigate arbitrary spatial content with pan, zoom, fitting, grid lines, and programmatic controls.',
  layout: 'docs.11ty.js',
  tag: 'nve-viewport',
  associatedElements: ['nve-viewport-gridlines', 'nve-viewport-minimap', 'nve-viewport-zoom-range']
}
---

## Installation

{% install 'nve-viewport' %}

## Panning

{% api 'nve-viewport', 'property', 'behaviorPan' %}

## Zooming

{% api 'nve-viewport', 'property', 'behaviorZoom' %}

## Customizable Minimap

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'Minimap' '{ "inline": false, "height": "420px" }' %}

## Interactive Content

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'InteractiveContent' '{ "inline": false, "height": "420px" }' %}

## Panning with Space

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'PanWithSpace' '{ "inline": false, "height": "420px" }' %}

## Invoker Commands

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'Commands' '{ "inline": false, "height": "420px" }' %}

## Programmatic Navigation

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'ProgrammaticNavigation' '{ "inline": false, "height": "420px" }' %}

## Dot Grid

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'Dots' '{ "inline": false, "height": "420px" }' %}

## Cross Grid

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'Crosses' '{ "inline": false, "height": "420px" }' %}

## Customizable Background

{% example '@nvidia-elements/core/viewport/viewport.examples.json' 'Background' '{ "inline": false, "height": "420px" }' %}
