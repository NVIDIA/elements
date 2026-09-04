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

| Geometry source                                              | Listen on             | Events                                                                | Identify the result                      |
| ------------------------------------------------------------ | --------------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| Declarative `<nve-scene-marker>` children                    | The marker            | `click`, `pointerenter`, and `pointerleave`                           | The marker element                       |
| Buffer-backed markers and layers without declarative markers | The interactive layer | `nve-scene-click`, `nve-scene-pointerenter`, `nve-scene-pointerleave` | `event.detail.instanceIndex` and `layer` |

## Declarative Interactions

Declarative markers are DOM event targets. Add listeners directly to each marker and handle the routed pointer events like events from other elements. The layer still needs the `interactive` attribute so Scene performs the hit test.

{% example 'nve-scene-marker' 'Interactions' %}

## Dynamic Interactions

Buffer-backed geometry doesn't create one DOM element for each record. Scene dispatches custom interaction events on the owning layer instead. Read `event.detail.instanceIndex` to identify the selected record and `event.detail.worldPosition` to get the hit position in world coordinates. When an interaction changes a bound buffer record, call the layer's `commit(start, count)` method to upload the changed range. See [Scene Record Buffers](/docs/scene/record-buffers/) for the complete mutation and commit contract.

{% example 'nve-scene-marker' 'InteractionsList' %}

## Request a Pick

Call `scene.pick(clientX, clientY)` to query geometry at browser viewport coordinates. The method returns a promise that resolves to a `PickHit` or `null` when no geometry is under the point. A programmatic pick considers rendered geometry even when its layer doesn't have the `interactive` attribute, and it doesn't dispatch interaction events.

```js
const hit = await scene.pick(pointerEvent.clientX, pointerEvent.clientY);

if (hit) {
  console.log(hit.element, hit.instanceIndex, hit.worldPosition);
}
```

| Property        | Description                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `element`       | Declarative marker for marker children, or the owning layer for buffer-backed and layer geometry |
| `layer`         | Layer that owns the rendered geometry                                                            |
| `instanceIndex` | Zero-based record index within the layer                                                         |
| `worldPosition` | Read-only `[x, y, z]` hit position in Scene world coordinates                                    |

Use the event coordinates directly. Scene accounts for the canvas position, size, and device pixel ratio when it resolves the hit.
