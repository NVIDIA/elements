---
{
  title: 'Scene Cubes',
  description: 'Source-backed cube instances for a Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-cubes'
}
---

## Installation

{% install 'nve-scene-cubes' %}

## Buffer Source

{% example 'nve-scene-cubes' 'BufferSource' %}

## Streaming

{% example 'nve-scene-cubes' 'Streaming' %}

## Volumes and Outlines

Use `outlineColor` independently from `color` to preserve box boundaries through overlapping translucent faces. JSON source records and `CubeBuffer` records expose the same field.

{% example 'nve-scene-cubes' 'Volumes' %}

## Performance

{% example 'nve-scene-cubes' 'Performance' '{ "inline": false, "height": "600px" }' %}
