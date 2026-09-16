---
{
  title: 'Scene Arrows',
  description: 'Instanced arrow glyphs for vectors in a Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-arrows'
}
---

## Installation

{% install 'nve-scene-arrows' %}

## Buffer sources

Use an `ArrowBuffer` for dense or frequently updated arrow sets. Records use `origin`, `vector`, and `shaftDiameter`. The fixed geometry uses 80% of the vector length for the shaft and 20% for the head, whose diameter is twice the shaft diameter.

{% example 'nve-scene-arrows' 'BufferSource' %}

Use a separate [Scene Labels](/docs/scene/labels/) layer when arrows need text annotations.
