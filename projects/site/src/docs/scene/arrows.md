---
{
  title: 'Scene Arrows',
  description: 'Instanced arrow glyphs for vectors in a Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-arrows',
  associatedElements: ['nve-scene-marker']
}
---

## Installation

{% install 'nve-scene-arrows' %}

## Buffer sources

Use a `MarkerBuffer` for dense or frequently updated arrow sets. Add marker records directly with `position`, `orientation`, and `scale`; arrows point along their local positive z-axis.

{% example 'nve-scene-arrows' 'BufferSource' %}

Use a separate [Scene Labels](/docs/scene/labels/) layer when arrows need text annotations.
