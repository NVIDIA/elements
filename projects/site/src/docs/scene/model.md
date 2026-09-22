---
{
  title: 'Scene Model',
  description: 'Imported and authored model geometry with shared instance placements for Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-model',
  associatedElements: ['nve-scene-part']
}
---

## Installation

{% install 'nve-scene-model' %}

Use `asset` for a model file URL, `geometry` for model nodes, and `source` for instance placements. Direct `nve-scene-part` children define primitive geometry declaratively. A model without a source uses one identity placement; assign a `MarkerBuffer` or a JSON `source` attribute to place many instances.

## Load a model file

{% example 'nve-scene-model' 'FileAsset' %}

```html
<nve-scene-model asset="/models/robot-arm.stl" tint="#39404e" aria-label="Robot arm"></nve-scene-model>
```

Scene supports ASCII and binary STL files. The decoder preserves coordinates and units without centering or resizing the model. Use frames, geometry transforms, or source records to place it. For a URL without a file extension, specify `format="stl"`. The URL extension ignores query strings and fragments and accepts uppercase extensions.

```js
const model = document.querySelector('nve-scene-model');
model.asset = '/models/robot-arm.stl';
await model.loadComplete;
const nodes = model.geometry;
```

`loadComplete` resolves after decoding and geometry capture. It doesn't wait for the GPU to display the model. Changing `asset` or `format`, assigning `geometry`, or disconnecting the element cancels a pending request and rejects
that request's promise with `AbortError`. A new file request clears previous resolved geometry while loading. File failures reject the promise, report a local `model-asset` diagnostic, and leave the model inert. Other layers remain
usable. Reconnecting restarts an unfinished request. Completed captures survive disconnection and device recovery.

Scene loads files only while the element has a connection to the document. `geometry` returns `null` while a file is pending or failed. An empty decoded file returns an empty array. Only STL has a built-in decoder; the same properties can support additional formats.

## Author geometry

```html
<nve-scene-model aria-label="Robot arm base">
  <nve-scene-part shape="cylinder" position="[0,0,0.15]" scale="[0.58,0.58,0.3]" color="#39404e"></nve-scene-part>
</nve-scene-model>
```

Use the same definitions in JavaScript:

```js
model.geometry = [
  { shape: 'cylinder', position: [0, 0, 0.15], scale: [0.58, 0.58, 0.3], color: '#39404e' }
];
```

`SceneModelGeometry` is an array of root nodes. A primitive node defines `shape`, a mesh node defines `geometry` using
`SceneMeshGeometry`, and a group node defines `children`. Each node supports an optional descriptive `name` and a
local transform. Names need not be unique.

```js
model.geometry = [
  {
    name: 'arm',
    position: [0, 0, 0.3],
    children: [
      { shape: 'cylinder', scale: [0.1, 0.1, 0.6], color: '#39404e' },
      { geometry: { positions: vertices, indices: triangles }, color: '#76b900' }
    ]
  }
];
```

A node uses either `position`/`orientation`/`scale` or a column-major affine `matrix` in a `Float32Array`, never both. The matrix must be finite and have an inverse. The graph preserves hierarchy, while rendering batches its static surfaces. Use scene frames for articulated movement; changing geometry recaptures the model.

Reading `geometry` exposes the current definitions from assignment, file decoding, or child declarations. Rendering owns a separate capture. In-place edits to arrays, nodes, or transforms don't change rendering until reassignment,
including reassignment of the same object. Invalid direct assignments throw before replacing accepted geometry.

## Tint

`tint` accepts a CSS color string and defaults to white. It multiplies primitive, mesh, and vertex base colors in linear color space. White preserves those colors; black surfaces remain black under any tint. Changing tint updates a shader factor without decoding the file or rebuilding geometry. Tint doesn't replace materials or change their other properties.

## Decode outside an element

```js
import { loadModel, decodeModel } from '@nvidia-elements/scene/model';

model.geometry = await loadModel('/models/robot-arm.stl', { signal: controller.signal });
model.geometry = await decodeModel(bytes, { format: 'stl', signal: controller.signal });
```

Both helpers return model nodes and accept an optional abort signal. `decodeModel` accepts an `ArrayBuffer` or an array view and captures the selected bytes before asynchronous decoding. Helpers don't register custom elements or require WebGPU. File and compiled geometry allocations each have a 256 MiB limit; hierarchies also have node and depth limits.

## Robot Arm Animated

{% example 'nve-scene-model' 'RobotArmAnimated' %}
