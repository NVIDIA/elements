---
{
  title: 'Scene Record Buffers',
  description: 'Create, mutate, and share packed marker and vertex data efficiently.',
  layout: 'docs.11ty.js'
}
---

# Scene Record Buffers

Scene record buffers provide fixed-capacity packed storage for marker instances and streamed vertices. Each buffer exposes `capacity`, the fixed allocation size, and `count`, the active contiguous prefix. Assign the buffer to the matching layer property.

## Buffer Types

| Buffer                 | Record data                                   | Compatible layer property                           |
| ---------------------- | --------------------------------------------- | --------------------------------------------------- |
| `MarkerBuffer`         | Transform, color, and outline color           | Marker layer `instances`, such as cubes or pyramids |
| `PointBuffer`          | Position and color                            | `nve-scene-points.instances`                        |
| `LineVertexBuffer`     | Position, color, normal, width, dash, and gap | `nve-scene-lines.vertices`                          |
| `TriangleVertexBuffer` | Position and color                            | `nve-scene-triangles.vertices`                      |

Use a buffer only with a compatible layer. Scene rejects a point, line, or triangle buffer when its record layout doesn't match the target layer.

## Choose a Write Method

Every record buffer provides the same write methods and cache contract.

| Method               | Use it for                                     | Commit behavior                                                |
| -------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| `set(index, fields)` | Initial population and complete record updates | Updates the source version without a buffer `commit()`         |
| `add(fields)`        | Appending a record and retaining its handle    | Call the buffer's `commit()` before assignment or source reuse |
| `at(index)`          | Mutating an existing record through a handle   | Call the buffer's `commit()` before assignment or source reuse |
| `bytes`              | Integrating a custom packed-data producer      | Call the buffer's `commit()` after direct writes               |

Prefer `set()` when code already has all fields for a record. Use handles when incremental property updates make the code easier to understand. Accessing a handle or `bytes` marks the source as externally mutable, so Scene skips its prepared-source cache until the buffer receives a `commit()`. This fallback preserves correct rendering through defensive validation and copying, but repeated assignments cost more.

## Marker Buffer Examples

Marker layers include cones, cubes, cylinders, pyramids, spheres, and mesh instances. They all consume the same `MarkerBuffer` layout.

### Complete Marker Writes

`set()` writes a complete marker without creating a mutable handle. It updates the source version and keeps the prepared-source cache available, so initial construction doesn't require a separate buffer `commit()`.

```js
import { MarkerBuffer } from '@nvidia-elements/scene';

const markers = new MarkerBuffer({ capacity: 1 });

markers.set(0, {
  color: 'rgba(118,185,0,0.85)',
  position: [0, 0, 0.75],
  scale: [1, 1, 1.5]
});

document.querySelector('#imperative-pyramid').instances = markers;
```

`set()` replaces the complete record. Include every value that the record should preserve; omitted fields return to their defaults.

### Mutable Marker Handles

`add()` appends a marker and returns its stable mutable handle. `at()` returns the stable handle for an active marker. Call the buffer's `commit()` after a group of handle writes and before assigning or reusing the source.

```js
import { MarkerBuffer } from '@nvidia-elements/scene';

const markers = new MarkerBuffer({ capacity: 1 });
const pyramid = markers.add({ color: 'rgba(118,185,0,0.85)' });

pyramid.position.set(0, 0, 0.75);
pyramid.scale.set(1, 1, 1.5);

markers.commit();
document.querySelector('#imperative-pyramid').instances = markers;
```

The comparison below uses a handle because it applies transform fields incrementally.

{% example '@nvidia-elements/scene/index.examples.json' 'PyramidComparison' %}

## Vertex Buffer Examples

Point, line, and triangle buffers use the same write and commit contract as marker buffers. Their record fields and compatible layer properties differ.

### Point Vertices

`PointBuffer` stores a position and color for each point. The layer controls the uniform point size and whether that size uses CSS pixels or scene units. The example uses `set()` because each point arrives as one complete record.

{% example 'nve-scene-points' 'Default' %}

### Line Vertices

`LineVertexBuffer` stores geometry and outgoing-segment style together. Each record can set its position, color, normal, width, dash, and gap. The last vertex provides an endpoint, so its outgoing style doesn't affect a strip unless another vertex follows it.

{% example 'nve-scene-lines' 'SegmentStyles' %}

### Triangle Vertices

`TriangleVertexBuffer` stores position and color records in triangle-list order. Supply three vertices for each triangle. The path example builds each corridor section as two triangles and uses `set()` for allocation-free population.

{% example 'nve-scene-triangles' 'Path' %}

## Update a Bound Layer

A buffer `commit()` records source mutations for later assignment or sharing. A layer `commit()` schedules an upload from an already bound source. This distinction applies to both marker and vertex buffers.

For a complete replacement, `set()` already updates the source version. The bound layer still needs its own upload commit.

```js
points.set(0, {
  color: 'cyan',
  position: [0, 0, 1.25]
});

pointLayer.commit(0, 1);
```

Call both commits when code mutates a retained handle and might assign or share the source again later.

```js
const point = points.at(0);
point.position.z = 1.5;

points.commit(0, 1);
pointLayer.commit(0, 1);
```

The streaming trail keeps one `LineVertexBuffer` bound to one line layer. It uses the buffer's `bytes` view for compacting and alpha updates, then calls the layer's `commit()` only for the changed vertex range. Call the buffer's `commit()` too if later code assigns that source again.

{% example 'nve-scene-lines' 'StreamingTrail' %}

## Share One Source

Populate shared sources with `set()` so Scene can prepare the record data once and reuse it across compatible layer assignments.

```js
const markers = new MarkerBuffer({ capacity: data.length });

data.forEach((fields, index) => markers.set(index, fields));

cubes.instances = markers;
pyramids.instances = markers;
spheres.instances = markers;
```

Vertex buffers can also serve more than one compatible layer.

```js
const points = new PointBuffer({ capacity: samples.length });

samples.forEach((sample, index) => points.set(index, sample));

overviewPoints.instances = points;
detailPoints.instances = points;
```

If code populated the source through handles or direct byte writes, call the buffer's `commit()` before assigning it to the first layer. Call each bound layer's `commit()` after later in-place mutations that should appear in that layer.

## Direct Byte Writes

Use the `bytes` view when a producer already emits a built-in packed layout. Scene exports the read-only `MARKER`, `POINT`, `LINE_VERTEX`, and `TRI_VERTEX` descriptors for canonical offsets and strides. These descriptors document the layouts accepted by public buffers and layers; Scene doesn't support consumer-defined layouts. Accessing `bytes` marks the source as externally mutable. Commit the written range before assigning or reusing the source.

Packed positions, orientations, and normals follow the Scene [coordinate, unit, and quaternion conventions](/docs/scene/frame/#coordinate-and-unit-conventions).

```js
import { POINT, PointBuffer } from '@nvidia-elements/scene';

const points = new PointBuffer({ capacity: 1 });
const bytes = points.bytes;
const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const positionOffset = POINT.fields.position.offset;

view.setFloat32(positionOffset, 0, true);
view.setFloat32(positionOffset + 4, 0, true);
view.setFloat32(positionOffset + 8, 0.75, true);

points.commit(0, 1);
document.querySelector('#example-points').instances = points;
```

Pass the smallest changed contiguous range to `commit(start, count)`. Smaller ranges reduce validation and GPU upload work when updates affect only part of a large buffer.
