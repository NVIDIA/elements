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

All query coordinates are local to the height field's frame and include the grid `origin` and positive `spacing`. A query outside the grid returns `undefined`. Drape methods return a copy, update only in-bounds XYZ triples, and preserve the input array.

`heightAt()`, `normalAt()`, and `slopeAt()` describe the continuous bilinear field between four cell samples. `drape()` uses the same bilinear elevation. These methods preserve their existing smooth-field behavior.

Rendered terrain uses two planar triangles per grid cell. Use `surfaceHeightAt()`, `surfaceNormalAt()`, `surfaceSlopeAt()`, and `drapeToSurface()` when application geometry must lie on those visible triangles.

```js
const height = terrain.surfaceHeightAt(localX, localY);
const normal = terrain.surfaceNormalAt(localX, localY);
const routeOnMesh = terrain.drapeToSurface(routePoints, 0.05);
```

The shared diagonal runs from the top-right sample to the bottom-left sample. Points exactly on that diagonal use the triangle containing the top-left sample. Surface normals and slopes are geometric face values, so they can change abruptly across a diagonal or cell edge. Outer-edge queries use the adjacent interior cell.
