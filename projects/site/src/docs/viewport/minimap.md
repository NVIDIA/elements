---
{
  title: 'Minimap',
  description: 'Show an overview of NVIDIA Elements viewport content and navigate its visible region.',
  layout: 'docs.11ty.js',
  tag: 'nve-viewport-minimap'
}
---

## Installation

{% install 'nve-viewport-minimap' %}

```js
import '@nvidia-elements/viewport/viewport/define.js';
import '@nvidia-elements/viewport/minimap/define.js';
```

## Usage

Place `nve-viewport-minimap` directly inside a [Viewport](/docs/viewport/). The component uses the overlay slot and draws rectangles for the viewport's content elements. Click the minimap background to center the viewport or drag the visible region to pan.

```html
<nve-viewport style="height: 420px;">
  <div>Viewport content</div>
  <nve-viewport-minimap></nve-viewport-minimap>
</nve-viewport>
```

## Custom Preview

Provide content in the `preview` slot to replace the automatic rectangles. Position preview content in the same coordinate system as the viewport content.

{% example '@nvidia-elements/viewport/minimap/minimap.examples.json' 'Default' '{ "inline": false, "height": "420px" }' %}

## Refreshing Bounds

Call `refresh()` after content or preview elements move without changing size.

{% api 'nve-viewport-minimap', 'method', 'refresh' %}
