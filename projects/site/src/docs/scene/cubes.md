---
{
  title: 'Scene Cubes',
  description: 'Cube marker instances for a Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-cubes',
  associatedElements: ['nve-scene-marker']
}
---

## Installation

{% install 'nve-scene-cubes' %}

## Streaming

{% example 'nve-scene-cubes' 'Streaming' %}

## Volumes and Outlines

Use `outline-color` independently from `color` to preserve box boundaries through overlapping translucent faces. `MarkerBuffer` records expose the same capability through the `outlineColor` property.

{% example 'nve-scene-cubes' 'Volumes' %}

## Performance

{% example 'nve-scene-cubes' 'Performance' '{ "inline": false, "height": "600px" }' %}
