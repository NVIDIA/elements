---
{
  title: 'Scene Body',
  description: 'Rigid bodies with named coordinate frames and compound visual geometry.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-body',
  associatedElements: ['nve-scene-shape']
}
---

## Installation

{% install 'nve-scene-body' %}

## Buffer source

{% example 'nve-scene-body' 'BufferSource' %}

## Body frame

{% api 'nve-scene-body' 'property' 'name' %}

Bodies represent the rigid links of an articulated model. A joint connects two bodies by name through its `parent` and `child` attributes. The incoming joint determines the child body frame; root bodies inherit the model placement. Empty bodies remain valid frames. See [joint connections](/docs/scene/joint/#body-connections).

{% api 'nve-scene-body' 'method' 'getWorldMatrix' %}

{% api 'nve-scene-body' 'method' 'getWorldPoint' %}

{% api 'nve-scene-body' 'method' 'getLocalPoint' %}

Use `frame` to attach an independent body or an additional coordinate frame. A child body driven by a joint cannot also author `frame`. Shape transforms and geometry-node transforms provide offsets within the body.

## Geometry

{% api 'nve-scene-body' 'property' 'geometry' %}

```html
<nve-scene-body aria-label="Robot arm base">
  <nve-scene-shape type="cylinder" position="[0,0,0.15]" scale="[0.58,0.58,0.3]" color="#39404e"></nve-scene-shape>
</nve-scene-body>
```

{% api 'nve-scene-shape' 'property' 'type' %}

```js
body.geometry = [
  {
    name: 'arm',
    position: [0, 0, 0.3],
    children: [
      { type: 'cylinder', scale: [0.1, 0.1, 0.6], color: '#39404e' },
      { geometry: { positions: vertices, indices: triangles }, color: '#76b900' }
    ]
  }
];
await body.loadComplete;
```

## Load geometry

{% api 'nve-scene-mesh' 'property' 'src' %}

{% example 'nve-scene-body' 'LoadGeometry' %}

## Decode outside an element

```js
import { loadGeometry, decodeGeometry } from '@nvidia-elements/scene';

body.geometry = await loadGeometry('/models/robot-arm.stl', { signal: controller.signal });
await body.loadComplete;
body.geometry = await decodeGeometry(bytes, { format: 'stl', signal: controller.signal });
await body.loadComplete;
```

## Register an external decoder

```js
import { registerGeometryDecoder } from '@nvidia-elements/scene';

registerGeometryDecoder('fake', () => import('./fake-geometry-decoder.js'));
```
