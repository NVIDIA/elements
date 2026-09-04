---
{
  title: 'Interaction',
  description: 'Pick rendered geometry and route pointer interactions through a 3D scene.',
  layout: 'docs.11ty.js'
}
---

# Scene Interaction

Scene converts browser viewport coordinates into hits on rendered geometry. Use routed interaction events when a layer should respond continuously to pointer input. Use `scene.pick()` when application logic needs one explicit hit test without dispatching an interaction event.

Add the `interactive` attribute to each layer that should receive automatic pointer hit testing. Layers aren't interactive by default. Keeping noninteractive layers out of the interaction pass avoids unnecessary picking work and prevents decorative geometry from receiving events. The event target depends on how the geometry enters the scene:

| Geometry source                           | Canonical event target | Identify the result        |
| ----------------------------------------- | ---------------------- | -------------------------- |
| Declarative `nve-scene-marker` children   | The marker             | `event.detail.element`     |
| Buffer-backed markers and streamed layers | The interactive layer  | `event.detail.target.kind` |

## Declarative Interactions

Declarative markers keep their native `click`, `pointerenter`, and `pointerleave` events. They also receive `nve-scene-click`, `nve-scene-pointerenter`, and `nve-scene-pointerleave` with a resolved spatial hit. Canonical events bubble through the layer and scene and cross shadow boundaries. The layer still needs the `interactive` attribute so Scene performs the hit test.

Native enter and leave describe DOM boundaries. Canonical enter and leave describe the resolved scene target. An application that listens to both streams receives both compatible notifications.

{% example 'nve-scene' 'Interactions' %}

## Dynamic Interactions

Buffer-backed geometry doesn't create one DOM element for each record. Scene dispatches canonical interaction events on the owning layer. Read `event.detail.target` for explicit source-record semantics and `event.detail.worldPosition` for the captured world coordinate. When an interaction changes a bound record, call `layer.publish({ start, count })` to capture the changed range. See [Scene Record Buffers](/docs/scene/record-buffers/) for the complete publication contract.

{% example 'nve-scene' 'InteractionsList' %}

## Request a Pick

Call `scene.pick(clientX, clientY)` to query geometry at browser viewport coordinates. The method returns a promise that resolves to a `ScenePickHit` or `null` when no geometry is under the point. A programmatic pick considers rendered geometry even when its layer doesn't have the `interactive` attribute, and it doesn't dispatch interaction events.

```js
const hit = await scene.pick(pointerEvent.clientX, pointerEvent.clientY);

if (hit) {
  console.log(hit.element, hit.target, hit.worldPosition);
}
```

| Property        | Description                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `element`       | Declarative marker for marker children, or the owning layer for buffer-backed and layer geometry |
| `layer`         | Layer that owns the rendered geometry                                                            |
| `target`        | Discriminated source identity with an `index` for instances, points, segments, and triangles     |
| `worldPosition` | Immutable `[x, y, z]` hit position in Scene world coordinates                                    |

Use the event coordinates directly. Scene accounts for the canvas position, size, and device pixel ratio when it resolves the hit.

## Interpret target indices

Narrow `target.kind` before using a source index. Line targets include the exact submitted vertex pair. Triangle targets include their three submitted vertex indices. Meshes identify instances rather than faces, and terrain reports `surface` because the current ID pass doesn't identify a terrain cell.

```ts
function selectSource(hit: ScenePickHit) {
  switch (hit.target.kind) {
    case 'instance':
      return markers.at(hit.target.index);
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

The hit, target, world position, and nested index tuples are immutable snapshots of submitted geometry. A later source, topology, marker membership, or marker ordering change doesn't reinterpret a pending result. Buffer-backed indices remain relative to that submitted application snapshot. Assign `featureIds` when application logic needs stable entity identity.

For automatic events, Scene verifies a captured declarative marker before dispatch. Removing, hiding, invalidating, or moving the marker to another layer suppresses the obsolete event instead of sending it to the marker that later occupies the same index. Programmatic `scene.pick()` still resolves its submitted snapshot.

When the pointer leaves or cancels over the Scene canvas, Scene dispatches one canonical leave event for the last hovered target and cancels pending hover work. A late readback can't restore the old hover. Pointer transitions to overlays or other content inside the same Scene don't create a false leave, and ordered down, up, and click work continues independently. Reentering the canvas starts a fresh hover query.

## Convert coordinates

Use `scene.getClientPoint(worldPoint)` to place DOM content at a world point from the most recently submitted frame. It returns viewport `clientX` and `clientY` values plus WebGPU depth and a `visible` or `clipped` status. It returns `null` before the first valid frame, behind a perspective camera, or while a resize awaits a matching submission.

```js
const point = scene.getClientPoint([2, 1, 0.5]);
if (point?.visibility === 'visible') {
  tooltip.style.transform = `translate(${point.clientX}px, ${point.clientY}px)`;
}
```

Frame conversion methods use current CPU transforms. This matters when geometry moves after an earlier pick snapshot.

```js
const localPoint = terrainFrame.getLocalPoint(hit.worldPosition);
if (localPoint) {
  const elevation = terrain.heightAt(localPoint[0], localPoint[1]);
}
```

Use `scene.getRay(clientX, clientY)` for application-owned geometric queries without GPU readback. The ray starts on the near plane and has a normalized world-space direction. This example intersects the world `z = 0` plane:

```js
const ray = scene.getRay(pointerEvent.clientX, pointerEvent.clientY);
if (ray && Math.abs(ray.direction[2]) > 1e-8) {
  const distance = -ray.origin[2] / ray.direction[2];
  const point = ray.origin.map((value, axis) => value + ray.direction[axis] * distance);
}
```

Projection helpers don't test geometric occlusion. They support an axis-aligned canvas viewport; rotated or perspective-transformed DOM canvases need application-specific coordinate mapping.

{% example 'nve-scene' 'CoordinateHelpers' %}

## Feature identity

Interactive layers can translate transient render targets into stable, layer-scoped application IDs. Scene reports the ID through `pick()` and interaction events without storing selection state.

```ts
const endpointFeatureIds = new Uint32Array([
  1842, 1842, // first segment
  1842, 1842, // second segment of the same pipe spool
  2710, 2710 // another pipe spool
]);

lines.featureIds = {
  values: endpointFeatureIds,
  stride: 2,
  nullFeatureId: 0
};

lines.addEventListener('nve-scene-click', event => {
  const inspectionRecord = inspections.get(event.detail.featureId);
  showInspectionRecord(inspectionRecord);
});
```

Use unsigned 32-bit integers for IDs. A number assigns one ID to the entire layer. A `Uint32Array` maps one value to each logical target. Descriptors resolve target `i` from `values[offset + Math.floor(i / repeat) * stride]`, which supports per-vertex source IDs without expanding them into another array. Marker and instanced-mesh targets are instances; stream targets are points, line segments, or triangles. For connected lines, a segment uses its starting-vertex index.

Scene copies the assigned array immediately. Mutate and reassign the producer array to publish a new identity generation. Applications remain responsible for reverse indexes and for updating existing colors when selection needs a visual treatment.

{% example 'nve-scene' 'FeatureIdentity' %}
