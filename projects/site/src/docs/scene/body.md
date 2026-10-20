---
{
  title: 'Scene Body',
  description: 'Authored rigid body geometry with shared instance placements for Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-body',
  associatedElements: ['nve-scene-shape']
}
---

## Installation

{% install 'nve-scene-body' %}

A body is one rigid compound of shapes. Use `geometry` for body nodes and `source` for instance placements.
Direct `nve-scene-shape` children define primitive geometry declaratively. A body without a source uses one identity
placement; assign a `MarkerBuffer` or a JSON `source` attribute to place many instances. Use `src` to load geometry from a file through an extension-selected decoder.

## Author geometry

```html
<nve-scene-body aria-label="Robot arm base">
  <nve-scene-shape kind="cylinder" position="[0,0,0.15]" scale="[0.58,0.58,0.3]" color="#39404e"></nve-scene-shape>
</nve-scene-body>
```

Use the same definitions in JavaScript:

```js
body.geometry = [
  { kind: 'cylinder', position: [0, 0, 0.15], scale: [0.58, 0.58, 0.3], color: '#39404e' }
];
```

`SceneBodyGeometry` is an array of root nodes. A primitive node defines `kind`, a mesh node defines `geometry` using
`SceneMeshGeometry`, and a group node defines `children`. Each node supports an optional descriptive `name` and a
local transform. Names need not be unique.

```js
body.geometry = [
  {
    name: 'arm',
    position: [0, 0, 0.3],
    children: [
      { kind: 'cylinder', scale: [0.1, 0.1, 0.6], color: '#39404e' },
      { geometry: { positions: vertices, indices: triangles }, color: '#76b900' }
    ]
  }
];
```

A node uses either `position`/`orientation`/`scale` or a column-major affine `matrix` in a `Float32Array`, never both. The matrix must be finite and have an inverse. The graph preserves hierarchy, while rendering batches its static surfaces. Use scene frames for articulated movement; changing geometry recaptures the body.

Reading `geometry` exposes the current definitions from assignment, file decoding, or child declarations. Rendering owns a separate capture. In-place edits to arrays, nodes, or transforms don't change rendering until reassignment,
including reassignment of the same object. Invalid direct assignments throw before replacing accepted geometry.

## Load geometry

{% example 'nve-scene-body' 'FileAsset' %}

```html
<nve-scene-body src="/bodies/robot-arm.stl" tint="#39404e" aria-label="Robot arm"></nve-scene-body>
```

The concept element carries `src`; formats are lazy decoders. Scene ships ASCII and binary STL support.
The URL extension selects the decoder. Query parameters and fragments do not affect dispatch. Unknown or missing extensions
report `body-src` without fetching. Coordinates and units remain unchanged; frames and instance records place
geometry. Bodies have no `format` attribute. The URL fragment supports future sub-asset selection and passes unchanged,
including `#` and percent escapes; STL ignores it.

`loadComplete`. It decodes ASCII or binary STL regardless
of the URL extension. Coordinates and units remain unchanged; frames and instance records place the geometry.

`loadComplete` resolves after decoding and geometry capture, before GPU presentation. Changing `src`, assigning
`geometry`, or disconnecting cancels a pending request with `AbortError`. Direct geometry assignment clears `src`.
An unfinished request restarts on reconnect. Completed geometry survives disconnection and device recovery.

The body loads only while connected. Pending or failed file input exposes `geometry` as `null`; an empty file
returns an empty array. File failures reject `loadComplete`, report `body-src`, and leave unrelated content usable.
File and compiled geometry allocations each have a 256 MiB limit.

## Tint

`tint` accepts a CSS color string and defaults to white. It multiplies primitive, mesh, and vertex base colors in linear color space. White preserves those colors; black surfaces remain black under any tint. Changing tint updates a shader factor without decoding the file or rebuilding geometry. Tint doesn't replace materials or change their other properties.

## Decode outside an element

```js
import { loadGeometry, decodeGeometry } from '@nvidia-elements/scene/body';

body.geometry = await loadGeometry('/models/robot-arm.stl', { signal: controller.signal });
body.geometry = await decodeGeometry(bytes, { format: 'stl', signal: controller.signal });
```

Both helpers return body nodes and accept an optional abort signal. `decodeGeometry` accepts an `ArrayBuffer` or an array view and captures the selected bytes before asynchronous decoding. Helpers don't register custom elements or require WebGPU. File and compiled geometry allocations each have a 256 MiB limit; hierarchies also have node and depth limits.

## Register an external decoder

```js
import { registerGeometryDecoder } from '@nvidia-elements/scene/body';

registerGeometryDecoder('fake', () => import('./fake-geometry-decoder.js'));
```

The module exposes `decode(bytes, { fragment, signal })`, returning a promise of `SceneBodyGeometry`. The loader
runs only on a request for that extension. Extensions accept an optional leading dot and compare without case.
Registering an existing extension, including built-in STL, throws. External packages own any decoder dependencies.
`loadGeometry` and `decodeGeometry` use the same registry as the element.

## Buffer Source

{% example 'nve-scene-body' 'BufferSource' %}

## Robot Arm

{% example 'nve-scene-body' 'RobotArm' %}

## Robot Arm Animated

{% example 'nve-scene-body' 'RobotArmAnimated' %}
