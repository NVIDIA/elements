---
{
  title: 'Scene Record Buffers',
  description: 'Create, publish, and share packed scene records efficiently.',
  layout: 'docs.11ty.js'
}
---

# Scene Record Buffers

Scene record buffers provide fixed-capacity packed storage for instances and streamed vertices. A buffer's `capacity` is its fixed allocation size. Its `count` is the active contiguous prefix. Assign a buffer to the matching layer, then publish changes from that layer.

## Buffer types

| Buffer                                                        | Compatible layer property         |
| ------------------------------------------------------------- | --------------------------------- |
| `ArrowBuffer`                                                 | `nve-scene-arrows.source`         |
| `CubeBuffer`, `SphereBuffer`, `CylinderBuffer`, `ConeBuffer`  | Matching primitive layer `source` |
| `PyramidBuffer`                                               | `nve-scene-pyramids.source`       |
| `MarkerBuffer`                                                | Mesh, model, and polygon `source` |
| `PointBuffer`, `LineVertexBuffer`, and `TriangleVertexBuffer` | Matching streamed layer `source`  |

Use a buffer only with its compatible layer. Primitive layers reject generic marker buffers and buffers for other primitives. External packed marker sources are an advanced integration escape hatch. Their producer must meet the target primitive's encoding invariants.

## Initialize a buffer

All public buffers accept a capacity, records, or both. Omitting `capacity` uses `records.length`. An explicit capacity can't be smaller than the seeded record count. Construction validates and packs all records before it returns the buffer. Unused capacity remains initialized but inactive.

```js
import { ArrowBuffer } from '@nvidia-elements/scene/arrows';

const reserved = new ArrowBuffer({ capacity: 100 });
const exact = new ArrowBuffer({ records: initialArrows });
const seeded = new ArrowBuffer({ capacity: 100, records: initialArrows });
```

For centered primitives, `position` defaults to the origin, `orientation` defaults to the identity quaternion, and `size` defaults to `[1, 1, 1]`. `size` contains full local dimensions:

| Primitive | X               | Y               | Z          |
| --------- | --------------- | --------------- | ---------- |
| Cube      | Width           | Depth           | Height     |
| Sphere    | X diameter      | Y diameter      | Z diameter |
| Cylinder  | X base diameter | Y base diameter | Height     |
| Cone      | X base diameter | Y base diameter | Height     |
| Pyramid   | Base width      | Base depth      | Height     |

Arrow records use `origin`, `vector`, and `shaftDiameter`. An arrow points along its vector. Its shaft occupies 80% of the vector length. Its head occupies 20%, and the head diameter is twice the shaft diameter.

## HTML source attributes

The `source` attribute is a serialized initialization format for modest static data. It requires strict JSON with double-quoted keys and values. Scene validates the records once and creates the matching specialized buffer.

```html
<nve-scene-cylinders
  source='[{"position":[0,0,1],"size":[1,1,2],"color":"cyan","featureId":42}]'
></nve-scene-cylinders>
```

The JavaScript `source` property represents the resolved packed source. It accepts only the matching buffer or a compatible external packed source, not record arrays. Property assignments don't reflect to the attribute. Removing the attribute sets `source` to `null`.

## Write and publish records

Every record buffer provides the following operations:

| Operation            | Effect                                                                 |
| -------------------- | ---------------------------------------------------------------------- |
| `set(index, fields)` | Replaces one active record or appends at `count`                       |
| `add(fields)`        | Appends one record and returns its stable mutable handle               |
| `at(index)`          | Returns the stable handle for an active storage slot                   |
| `mutableBytes`       | Returns the complete mutable canonical packed-data allocation          |
| `setCount(count)`    | Changes the source's active prefix without resizing or publishing it   |
| `layer.publish()`    | Validates and captures source changes for that one layer synchronously |

`publish()` separates source bookkeeping from a layer's captured rendering snapshot. It accepts `{ start, count, activeCount }`. `start` and `count` identify changed records, not bytes. `activeCount` selects the complete prefix for that layer.

```js
import { PointBuffer } from '@nvidia-elements/scene/points';

const points = new PointBuffer({ capacity: 1000 });
const first = points.add({ color: 'cyan', position: [0, 0, 1] });
points.add({ color: 'magenta', position: [1, 0, 1] });

pointLayer.source = points;
first.position.z = 1.5;
pointLayer.publish({ count: 1, start: first.index });
```

Calling `publish()` without options uses a typed buffer's current `count`. It never activates unused capacity. A retained handle or byte view can identify an inactive storage slot, but writing it doesn't reactivate that slot.

## Append, shrink, and regrow

`add()` and `set()` at the current count append. Use `setCount()` to shrink or regrow the source prefix. Regrowth is valid only when the exposed records contain valid initialized values. It keeps the existing storage.

```js
const cubesSource = new CubeBuffer({
  capacity: 1000,
  records: [
    { color: 'yellow', position: [0, 0, 0.5] },
    { color: 'cyan', position: [1, 0, 0.5] }
  ]
});
cubes.source = cubesSource;

cubesSource.setCount(0);
cubes.publish({ count: 0 }); // Hide all records without uploading unchanged bytes.

cubesSource.setCount(2);
cubes.publish({ count: 0, start: 2 }); // Capture the newly exposed interval.
```

`layer.countLimit` remains a separate visibility limit. If the source shrinks, Scene preserves the authored layer limit and clamps the effective draw count. Regrowing the source can restore records without rewriting the limit.

Record handles identify storage slots rather than application entities. After an application reuses a slot for another record, the same index identifies the new record.

## Share one source

Each layer owns its published snapshot. Publishing one layer never changes another layer that shares the source.

```js
const markers = new MarkerBuffer({ records: data });

meshA.source = markers;
meshB.source = markers;

markers.at(0).color = 'magenta';
meshA.publish({ count: 1, start: 0 });
// The second mesh snapshot remains unchanged until meshB.publish().
```

This isolation also applies after device recovery. Scene rebuilds each layer from its last published capture, not from later unpublished producer mutations.

## Direct byte writes

Use `mutableBytes` only when a producer needs bulk or in-place writes that record handles can't express efficiently. The view follows the exported canonical layout descriptors, including each field offset, record stride, numeric type, and little-endian encoding.

```js
const bytes = points.mutableBytes;
const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const position = POINT.fields.position.offset;

view.setFloat32(position, 2, true);
view.setFloat32(position + 4, 1, true);
view.setFloat32(position + 8, 0.5, true);
points.setCount(1);
pointLayer.source = points;
```

Accessing `mutableBytes` permanently disables prepared-source caching for that buffer because later byte writes can't advance its observable `version`. This preserves direct producer access and correct publication semantics. Prefer `set()`, `add()`, and record handles for infrequently changing sources that feed more than one layer or scene. Those APIs advance `version`, allowing every consumer of one unchanged generation to reuse its prepared snapshot.

## Bounded updates

Publication validates the selected active prefix before advancing the layer. Invalid records, ranges, or line and triangle counts make the contribution inert without partially publishing a mixture of generations. A later valid publication recovers it.

Pass the smallest accurate changed range. A count-only reduction can use `count: 0`, and a fixed-size edit uploads only that record range. When active count grows, Scene also captures newly exposed records even if the requested dirty range excludes them.

{% example 'nve-scene-lines' 'StreamingTrail' %}
