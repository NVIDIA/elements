---
{
  title: 'Scene Record Buffers',
  description: 'Create, publish, and share packed scene records efficiently.',
  layout: 'docs.11ty.js'
}
---

# Scene Record Buffers

## Buffer types

| Buffer               | Layer                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------- |
| ArrowBuffer          | [Arrows](/docs/scene/arrows/)                                                         |
| CubeBuffer           | [Cubes](/docs/scene/cubes/)                                                           |
| SphereBuffer         | [Spheres](/docs/scene/spheres/)                                                       |
| CylinderBuffer       | [Cylinders](/docs/scene/cylinders/)                                                   |
| ConeBuffer           | [Cones](/docs/scene/cones/)                                                           |
| PyramidBuffer        | [Pyramids](/docs/scene/pyramids/)                                                     |
| MarkerBuffer         | [Mesh](/docs/scene/mesh/), [body](/docs/scene/body/), [polygon](/docs/scene/polygon/) |
| PointBuffer          | [Points](/docs/scene/points/)                                                         |
| LineVertexBuffer     | [Lines](/docs/scene/lines/)                                                           |
| TriangleVertexBuffer | [Triangles](/docs/scene/triangles/)                                                   |
| LabelBuffer          | [Labels](/docs/scene/labels/)                                                         |

## Initialize and mutate a buffer

{% api 'nve-scene-cubes' 'property' 'source' %}

```js
import { ArrowBuffer } from '@nvidia-elements/scene/arrows';

const reserved = new ArrowBuffer({ capacity: 100 });
const exact = new ArrowBuffer({ records: initialArrows });
const seeded = new ArrowBuffer({ capacity: 100, records: initialArrows });
```

## HTML source attributes

```html
<nve-scene-cylinders
  source='[{"position":[0,0,1],"size":[1,1,2],"color":"cyan","featureId":42}]'
></nve-scene-cylinders>
```

## Write and publish records

{% api 'nve-scene-points' 'property' 'source' %}

{% api 'nve-scene-points' 'method' 'publish' %}

```js
import { PointBuffer } from '@nvidia-elements/scene/points';

const points = new PointBuffer({ capacity: 1000 });
const first = points.add({ color: 'cyan', position: [0, 0, 1] });
points.add({ color: 'magenta', position: [1, 0, 1] });

pointLayer.source = points;
first.position.z = 1.5;
pointLayer.publish({ count: 1, start: first.index });
```

## Append, shrink, and regrow

{% api 'nve-scene-cubes' 'property' 'countLimit' %}

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

## Share one source

{% api 'nve-scene-mesh' 'method' 'publish' %}

```js
const markers = new MarkerBuffer({ records: data });

meshA.source = markers;
meshB.source = markers;

markers.at(0).color = 'magenta';
meshA.publish({ count: 1, start: 0 });
// The second mesh snapshot remains unchanged until meshB.publish().
```

## Direct byte writes

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

## Bounded updates

{% example 'nve-scene-lines' 'StreamingTrail' %}
