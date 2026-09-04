---
{
  title: 'Scene Record Buffers',
  description: 'Create, publish, and share packed marker and vertex data efficiently.',
  layout: 'docs.11ty.js'
}
---

# Scene Record Buffers

Scene record buffers provide fixed-capacity packed storage for marker instances and streamed vertices. A buffer's `capacity` is its fixed allocation size. Its `count` is the active contiguous prefix. Assign a buffer to the matching layer, then publish changes from that layer.

## Buffer types

| Buffer                 | Record data                                   | Compatible layer property                        |
| ---------------------- | --------------------------------------------- | ------------------------------------------------ |
| `MarkerBuffer`         | Transform, color, and outline color           | Marker-layer `source`, such as cubes or pyramids |
| `PointBuffer`          | Position and color                            | `nve-scene-points.source`                        |
| `LineVertexBuffer`     | Position, color, normal, width, dash, and gap | `nve-scene-lines.source`                         |
| `TriangleVertexBuffer` | Position and color                            | `nve-scene-triangles.source`                     |

Use a buffer only with its compatible layer. Point and triangle sources remain distinct even though their current strides match.

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
import { PointBuffer } from '@nvidia-elements/scene';

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
const markers = new MarkerBuffer({ capacity: 1000 });
markers.add({ color: 'yellow', position: [0, 0, 0.5] });
markers.add({ color: 'cyan', position: [1, 0, 0.5] });
cubes.source = markers;

markers.setCount(0);
cubes.publish({ count: 0 }); // Hide all records without uploading unchanged bytes.

markers.setCount(2);
cubes.publish({ count: 0, start: 2 }); // Capture the newly exposed interval.
```

`layer.countLimit` remains a separate visibility limit. If the source shrinks, Scene preserves the authored layer limit and clamps the effective draw count. Regrowing the source can restore records without rewriting the limit.

Record handles identify storage slots rather than application entities. After an application reuses a slot for another record, the same index identifies the new record.

## Share one source

Each layer owns its published snapshot. Publishing one layer never changes another layer that shares the source.

```js
const markers = new MarkerBuffer({ capacity: data.length });
data.forEach((fields, index) => markers.set(index, fields));

cubes.source = markers;
spheres.source = markers;

markers.at(0).color = 'magenta';
cubes.publish({ count: 1, start: 0 });
// The sphere snapshot remains unchanged until spheres.publish().
```

This isolation also applies after device recovery. Scene rebuilds each layer from its last published capture, not from later unpublished producer mutations.

## External packed sources

Use an explicit adapter when another producer owns canonical packed bytes. The adapter borrows the exact `Uint8Array` view with its offset and length. It doesn't copy or own the allocation.

```js
import { POINT, createPointSource } from '@nvidia-elements/scene';

const allocation = new Uint8Array(16 + POINT.stride * 4);
const bytes = allocation.subarray(16);
const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
view.setFloat32(POINT.fields.position.offset, 2, true);
view.setFloat32(POINT.fields.position.offset + 4, 1, true);
view.setFloat32(POINT.fields.position.offset + 8, 0.5, true);

const source = createPointSource({ bytes, count: 1 });
points.source = source;
view.setFloat32(POINT.fields.position.offset + 8, 0.75, true);
points.publish({ count: 1, start: 0 });
```

Scene also exports `createMarkerSource()`, `createLineVertexSource()`, and `createTriangleVertexSource()`. The functions throw when storage, alignment, count, or active record values are invalid, so a successfully returned source is always safe to assign.

An adapter's `count` is immutable. Create another descriptor over the same view to select a new producer count without allocating new records. Repeated changes at the same count need only `layer.publish()`. Scene rejects shared memory because it doesn't define a synchronization protocol for concurrent writes. A detached or transferred allocation becomes invalid on the next capture.

Layer source properties accept matching record buffers or typed external source adapters. They reject array-buffer views without a source type so equal byte lengths can't silently reinterpret one canonical format as another.

{% example 'nve-scene-points' 'ExternalProducer' %}

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

Accessing `mutableBytes` permanently disables prepared-source caching for that buffer because later byte writes can't advance its observable `version`. This preserves zero-copy producer access and correct publication semantics. Prefer `set()`, `add()`, and record handles for infrequently changing sources that feed more than one layer or scene. Those APIs advance `version`, allowing every consumer of one unchanged generation to reuse its prepared snapshot.

## Bounded updates

Publication validates the selected active prefix before advancing the layer. Invalid records, ranges, or line and triangle counts make the contribution inert without partially publishing a mixture of generations. A later valid publication recovers it.

Pass the smallest accurate changed range. A count-only reduction can use `count: 0`, and a fixed-size edit uploads only that record range. When active count grows, Scene also captures newly exposed records even if the requested dirty range excludes them.

{% example 'nve-scene-lines' 'StreamingTrail' %}
