---
{
  title: 'Viewport',
  description: 'Use the NVIDIA Elements viewport to navigate spatial content with pan, zoom, fitting, and programmatic controls.',
  layout: 'docs.11ty.js',
  tag: 'nve-viewport'
}
---

## Installation

{% install 'nve-viewport' %}

```js
import '@nvidia-elements/viewport/viewport/define.js';
```

Add [Gridlines](/docs/viewport/gridlines/) for a background grid or a [Minimap](/docs/viewport/minimap/) for an overview of the content. Register each component through its own entrypoint.

## Panning

{% api 'nve-viewport', 'property', 'behaviorPan' %}

## Zooming

{% api 'nve-viewport', 'property', 'behaviorZoom' %}

## Interactive Content

{% example '@nvidia-elements/viewport/viewport/viewport.examples.json' 'InteractiveContent' '{ "inline": false, "height": "420px" }' %}

## Panning with Space

{% example '@nvidia-elements/viewport/viewport/viewport.examples.json' 'PanWithSpace' '{ "inline": false, "height": "420px" }' %}

## Invoker Commands

{% example '@nvidia-elements/viewport/viewport/viewport.examples.json' 'Commands' '{ "inline": false, "height": "420px" }' %}

## Programmatic Navigation

{% example '@nvidia-elements/viewport/viewport/viewport.examples.json' 'ProgrammaticNavigation' '{ "inline": false, "height": "420px" }' %}

## Customizable Background

{% example '@nvidia-elements/viewport/viewport/viewport.examples.json' 'Background' '{ "inline": false, "height": "420px" }' %}
