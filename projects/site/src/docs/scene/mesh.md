---
{
  title: 'Scene Mesh',
  description: 'Indexed custom mesh geometry for Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-mesh'
}
---

## Installation

{% install 'nve-scene-mesh' %}

## Buffer Source

{% example 'nve-scene-mesh' 'BufferSource' %}

## Replace complete geometry

Assign `geometry` when positions, indices, normals, colors, or UV coordinates change as one application snapshot. Scene validates and copies the complete input before it publishes one generation. Omitted optional arrays clear their previous values, and `null` clears all geometry.

```js
const positions = new Float32Array([
  0, 0, 0,
  2, 0, 0,
  0, 2, 0,
  2, 2, 0
]);
const indices = new Uint32Array([0, 1, 2, 1, 3, 2]);

mesh.geometry = { indices, positions };
```

## Publish reused arrays

Use `publishGeometry()` to capture one changed attribute without replacing the complete geometry. `start` and `count` select vertices for positions, normals, colors, and UV coordinates. They select scalar indices for the `indices` attribute.

```js
positions[8] = 0.75;
mesh.publishGeometry({ attribute: 'positions', start: 2, count: 1 });
```

Scene copies the selected values into its current snapshot. Producer mutations outside the published range remain invisible, including after device recovery. Consecutive publications before a frame preserve all changed ranges. Invalid ranges or values throw without changing the last valid snapshot.

Assigning `geometry` is an explicit full update even when the array identity stays the same:

```js
positions[2] = 0.5;
mesh.geometry = { indices, positions };
```

Changing indices updates topology. Changing positions also refreshes generated normals when normals aren't supplied. Indexed flat geometry can require a full derived-attribute upload even for a partial source publication. The inherited `mesh.publish()` operation remains only for marker instances.

The producer can reuse its arrays after the assignment. Later edits don't change rendering or device recovery until the next `geometry` assignment or `publishGeometry()` call.

```js
positions[2] = 0.5;
positions[5] = 0.5;
mesh.geometry = { indices, positions };
```

The optional fields describe a complete replacement rather than a merge. This call clears old indices, normals, colors, and UV coordinates:

```js
mesh.geometry = { positions: nextPositions };
```

{% example 'nve-scene-mesh' 'GeometryUpdates' %}

Invalid complete input reports `mesh-geometry` and makes the mesh inert. Scene never combines valid arrays from one generation with invalid arrays from another. A later valid call recovers the contribution.

## Instances and materials

Mesh geometry has identity placement when it has no marker source, marker children, or explicit count. Add `nve-scene-marker` children for readable instances, or assign a `MarkerBuffer` and use the layer's `publish()` operation for frequent instance changes.

Material color, captured texture, and instance data remain independent from geometry replacement. Clearing UV coordinates doesn't clear a texture source, but Scene ignores that source and reports a warning until valid UV coordinates return.

## Capture a texture

Use `setTexture()` to capture an independent recovery source. The most recent request wins. Keep the input open until its promise settles; an `applied` result means the caller can close its bitmap. Scene never closes the caller's input.

```js
const input = await createImageBitmap(image);
const result = await mesh.setTexture(input);

if (result.status === 'applied') {
  input.close();
}
```

Calling `setTexture()` again replaces the owned capture. Scene closes only the captures that it owns. A superseded request resolves with `superseded`, while a current capture failure resolves with `failed`, reports `mesh-texture-capture`, and makes the mesh inert. A valid replacement or explicit clear recovers it.

```js
const replacement = await createImageBitmap(nextImage);
const result = await mesh.setTexture(replacement);
replacement.close();

if (result.status === 'failed') {
  await mesh.setTexture(null);
}
```

`setTexture(null)` clears the current rendering texture and releases Scene's owned capture. Capture doesn't need a connected scene or an active GPU device. Scene keeps the successful CPU snapshot across disconnects and rebuilds GPU resources from it.

{% example 'nve-scene-mesh' 'TextureCapture' %}
