---
{
  title: 'Scene polygon',
  description: 'Unlit polygon surfaces with concave boundaries, holes, and source-backed instances.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-polygon'
}
---

## Installation

{% install 'nve-scene-polygon' %}

A polygon without a source uses one identity placement. Assign a `MarkerBuffer` for retained updates or use a JSON `source` attribute for static placements. Polygon layers don't accept element children.

## Buffer Source

{% example 'nve-scene-polygon' 'BufferSource' %}
