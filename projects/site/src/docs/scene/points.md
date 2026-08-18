---
{
  title: 'Scene Points',
  description: 'Streamed point geometry for Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-points'
}
---

## Installation

{% install 'nve-scene-points' %}

Point size defaults to CSS pixels so dense point clouds and interface markers remain readable while the camera moves. Set `size-unit="world"` when `size` represents a distance in the scene and should scale with the camera projection.

## Size Units

{% example 'nve-scene-points' 'SizeUnits' %}

<!-- ## Lidar

{% example 'nve-scene-points' 'Lidar' %} -->
