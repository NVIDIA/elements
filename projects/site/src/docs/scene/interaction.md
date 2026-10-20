---
{
  title: 'Interaction',
  description: 'Pick rendered geometry and route pointer interactions through a 3D scene.',
  layout: 'docs.11ty.js'
}
---

# Scene Interaction

## Routed interactions

{% api 'nve-scene-cubes' 'property' 'interactive' %}

{% api 'nve-scene' 'event' 'nve-scene-click' %}

{% api 'nve-scene' 'event' 'nve-scene-pointerenter' %}

{% api 'nve-scene' 'event' 'nve-scene-pointerleave' %}

{% example 'nve-scene' 'Interactions' %}

## Retained interactions

{% example 'nve-scene' 'InteractionsList' %}

See [record buffers](/docs/scene/record-buffers/) for publishing interaction-driven record changes.

## Request a pick

{% api 'nve-scene' 'method' 'pick' %}

```js
const hit = await scene.pick(pointerEvent.clientX, pointerEvent.clientY);

if (hit) {
  console.log(hit.element, hit.target, hit.worldPosition);
}
```

## Interpret target indices

```ts
function selectSource(hit: ScenePickHit) {
  switch (hit.target.kind) {
    case 'instance':
      return markers.at(hit.target.index);
    case 'label':
      return labels.at(hit.target.index);
    case 'point':
      return points.at(hit.target.index);
    case 'segment':
      return hit.target.vertexIndices.map(index => lineVertices.at(index));
    case 'triangle':
      return hit.target.vertexIndices.map(index => triangleVertices.at(index));
    case 'surface':
      return terrain;
  }
}
```

## Convert coordinates

{% api 'nve-scene' 'method' 'getClientPoint' %}

```js
const point = scene.getClientPoint([2, 1, 0.5]);
if (point?.visibility === 'visible') {
  tooltip.style.transform = `translate(${point.clientX}px, ${point.clientY}px)`;
}
```

{% api 'nve-scene-frame' 'method' 'getLocalPoint' %}

```js
const localPoint = terrainFrame.getLocalPoint(hit.worldPosition);
if (localPoint) {
  const elevation = terrain.surfaceHeightAt(localPoint[0], localPoint[1]);
}
```

{% api 'nve-scene' 'method' 'getRay' %}

```js
// Intersect the world z = 0 plane.
const ray = scene.getRay(pointerEvent.clientX, pointerEvent.clientY);
if (ray && Math.abs(ray.direction[2]) > 1e-8) {
  const distance = -ray.origin[2] / ray.direction[2];
  const point = ray.origin.map((value, axis) => value + ray.direction[axis] * distance);
}
```

{% example 'nve-scene' 'CoordinateHelpers' %}

## Feature identity

{% example 'nve-scene' 'FeatureIdentity' %}

```js
// Source identities publish with the owning layer's captured geometry.
lineVertices.featureIds = {
  values: new Uint32Array([1842, 1842, 1842, 1842, 2710, 2710]),
  stride: 2
};
lines.publish();

lines.addEventListener('nve-scene-click', event => {
  const inspectionRecord = inspections.get(event.detail.featureId);
  showInspectionRecord(inspectionRecord);
});
```
