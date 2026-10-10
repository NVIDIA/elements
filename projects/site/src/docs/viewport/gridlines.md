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

```js
import '@nvidia-elements/viewport/viewport/define.js';
import '@nvidia-elements/viewport/gridlines/define.js';
```

## Usage

Place `nve-viewport-gridlines` directly inside a [Viewport](/docs/viewport/). The component uses the background slot and updates its grid as the viewport pans or zooms.

```html
<nve-viewport style="height: 420px;">
  <nve-viewport-gridlines></nve-viewport-gridlines>
  <div>Viewport content</div>
</nve-viewport>
```

## Grid Spacing

Set `step` to the smallest grid interval in content coordinates. Use `target-spacing` to control the target distance between grid marks on screen. The component adjusts the interval as the zoom level changes.

{% api 'nve-viewport-gridlines', 'property', 'step' %}

{% api 'nve-viewport-gridlines', 'property', 'targetSpacing' %}

## Dot Grid

{% example '@nvidia-elements/viewport/gridlines/gridlines.examples.json' 'Dots' '{ "inline": false, "height": "420px" }' %}

## Cross Grid

{% example '@nvidia-elements/viewport/gridlines/gridlines.examples.json' 'Crosses' '{ "inline": false, "height": "420px" }' %}
