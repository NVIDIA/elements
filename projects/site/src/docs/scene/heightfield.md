---
{
  title: 'Scene height field',
  description: 'Uniform-grid terrain for Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-heightfield'
}
---

## Installation

{% install 'nve-scene-heightfield' %}

## Robot Survey

{% example 'nve-scene-heightfield' 'RobotSurvey' %}

## Terrain Explorer

{% example 'nve-scene-heightfield' 'TerrainExplorer' %}

## Query terrain

{% api 'nve-scene-heightfield' 'method' 'heightAt' %}

{% api 'nve-scene-heightfield' 'method' 'normalAt' %}

{% api 'nve-scene-heightfield' 'method' 'slopeAt' %}

{% api 'nve-scene-heightfield' 'method' 'drape' %}

## Query the rendered surface

{% api 'nve-scene-heightfield' 'method' 'surfaceHeightAt' %}

{% api 'nve-scene-heightfield' 'method' 'surfaceNormalAt' %}

{% api 'nve-scene-heightfield' 'method' 'surfaceSlopeAt' %}

{% api 'nve-scene-heightfield' 'method' 'drapeToSurface' %}

```js
const height = terrain.surfaceHeightAt(localX, localY);
const normal = terrain.surfaceNormalAt(localX, localY);
const routeOnMesh = terrain.drapeToSurface(routePoints, 0.05);
```
