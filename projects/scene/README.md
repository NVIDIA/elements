# @nvidia-elements/scene

WebGPU-backed 3D Web Components for NVIDIA Elements. Scene is a curated, high-performance visualization foundation for operator-facing robotics and spatial-monitoring applications.

Scene uses declarative Web Components for stable scene structure and packed data paths for frequently updated geometry. Use it to display the current state of robots, facilities, telemetry, perception output, and spatial annotations.

The application owns transport, timing, buffering, interpolation, replay, and the selection of one coherent current snapshot. Scene owns snapshot validation, scene-local frame composition, GPU resources, rendering, label projection, picking, and device recovery. Scene does not store transform history or synchronize independent assignments. Prepare an atomic update before assigning its transforms, sensor buffers, and annotations. See the [Scene documentation](https://nvidia.github.io/elements/docs/scene/).

## Install and register

```sh
pnpm add @nvidia-elements/scene
```

Import the root entrypoint for types, canonical packed wire-format descriptors, buffer classes, and element classes without registering any custom elements.

```ts
import { MarkerBuffer, type Scene } from '@nvidia-elements/scene';
```

Import one `define.js` entrypoint when an app uses a specific element. It registers that element and its required Scene dependencies.

```ts
import '@nvidia-elements/scene/axes/define.js';
import '@nvidia-elements/scene/cubes/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/label/define.js';
```

## First scene

```html
<nve-scene aria-label="Robot visualization" style="height: 480px">
  <p slot="fallback">The 3D view is unavailable. Use the scene data table instead.</p>

  <nve-scene-gridlines></nve-scene-gridlines>
  <nve-scene-axes></nve-scene-axes>
  <nve-scene-cubes>
    <nve-scene-marker position="[0,0,0.5]" color="#76b900"></nve-scene-marker>
  </nve-scene-cubes>
  <nve-scene-label position="[0,0,1.4]"><span>origin cube</span></nve-scene-label>
</nve-scene>
```

`nve-scene` exposes its `aria-label` or `aria-labelledby` value to assistive technology and displays its `fallback` content if WebGPU initialization or recovery fails. Keep renderable layers, frames, camera behaviors, and labels as direct or frame-nested light-DOM descendants. A scene fails closed: an unavailable device, invalid layer, or unsupported label texture leaves that contribution inert instead of rendering misleading data. Handle bubbling, recoverable `nve-scene-error` events for diagnostics.

## Data and animation

Use `MarkerBuffer` to create fixed-capacity marker storage and mutate stable marker handles. Assign the buffer directly, then call `commit(start, count)` after later changes to upload the affected records.

```ts
import { MarkerBuffer } from '@nvidia-elements/scene';

const markers = new MarkerBuffer({ capacity: 2 });
const cube = markers.add({ color: 'rgb(118 185 0)' });
cube.position.set(0, 0, 0.5);
cubes.instances = markers;

cube.position.z = 1;
cubes.commit(0, 1);
```

`PointBuffer`, `LineVertexBuffer`, and `TriangleVertexBuffer` follow the same contract. `add()` appends a record and returns a stable mutable handle. For large write-only loops, `set(index, fields)` avoids creating handles; `at(index)` creates one only when needed. `capacity` describes the fixed allocation, while `count` reports the active prefix. Use `bytes` only when direct packed-byte access is useful.

Assigning a buffer snapshots its current active prefix. Records appended afterward remain hidden until a contiguous `commit(start, count)` uploads them. Raw `ArrayBufferView` sources remain available for producers that emit one of Scene's canonical packed formats.

Use `nve-scene-frame` for named, nested transforms. Each frame holds one current transform; apps own timelines, replay, and interpolation and update `frame.transform` or call `frame.setTransform()` with the selected snapshot. `frame.getWorldMatrix()` resolves the current transform through its parent frames. `nve-scene-camera` defaults to a static `pose` behavior, and a scene without a camera keeps its initial view static. Set `behavior="orbit"` explicitly to enable built-in view navigation. Repeat cameras with `orbit`, `follow`, or `top` behaviors to combine camera contributions. Camera elements are authoritative. Configure the orbit target, orbit offset, direct position, direct orientation, projection, and clipping. Set them through attributes or JavaScript properties. `scene.cameraState` is a read-only canonical pose and projection snapshot for inspection and camera-change events.

`scene.pick(clientX, clientY)` resolves a world-space hit. Declarative markers receive synthetic `click`, `pointerenter`, and `pointerleave` events. Streamed layers receive `nve-scene-click`, `nve-scene-pointerenter`, and `nve-scene-pointerleave` with the instance index and world position. Labels keep semantic DOM content and can reflect `stale` or `occluded` for document CSS. HTML-in-canvas label textures are capability-gated, so the accessible overlay remains the fallback path.

## Geometry

Use streamed `nve-scene-points`, `nve-scene-lines`, and `nve-scene-triangles` for wire-format overlays. Fixed marker layers (`cones`, `cubes`, `cylinders`, `pyramids`, and `spheres`) use `nve-scene-marker` children or a marker buffer. `nve-scene-mesh` accepts planar typed arrays; changing positions and normals with stable indices uses its upload-only path.

Point layers default to `size-unit="pixel"`, which interprets `size` in CSS pixels. Choose `size-unit="world"` for camera-facing points measured in scene units that grow or shrink with the camera projection.

Line records keep geometry and outgoing-segment style together. Choose `topology="strip"` for a connected path, `topology="loop"` to connect the last record to the first, or `topology="segments"` for independent record pairs. The default `width-unit="world"` interprets widths and dash patterns in scene units and uses each record's frame-local normal to orient the ribbon. Choose `width-unit="pixel"` to keep these values stable on screen.

```ts
import { LineVertexBuffer } from '@nvidia-elements/scene';

const vertices = new LineVertexBuffer({ capacity: 3 });
vertices.add({
  position: [-1, 0, 0],
  color: [0.46, 0.72, 0, 1],
  width: 0.1,
  dash: 0.2,
  gap: 0.1
});
vertices.add({ position: [0, 1, 0], width: 0 }); // Break the path after this vertex.
vertices.add({ position: [1, 0, 0] });
lines.vertices = vertices;
```

Each record styles the segment that starts at its position. A zero width creates a break, and a zero gap produces a solid segment. Dash patterns restart and center on each segment. The buffer defaults to a `0.1` scene-unit solid line with a `[0, 0, 1]` normal, so position-only records remain useful as segment endpoints.

`nve-scene-heightfield` renders a uniform terrain grid and provides local height, normal, slope, and drape queries. `nve-scene-model` compiles `nve-scene-part` children or a `parts` array into one mesh. Part edits rebuild geometry; animate model instances through markers or ancestor frames instead. `nve-scene-gridlines` and `nve-scene-axes` provide non-pickable frame-local reference geometry.

`nve-scene-polygon` fills a frame-local XY boundary at `z = 0` without directional lighting. Assign one atomic `geometry` object with an `outer` ring and optional `holes`; each ring contains `[x, y]` pairs. Scene accepts either winding and optional closing vertices, then removes consecutive duplicates and redundant collinear points before triangulation. Rings must remain simple, and holes must stay strictly inside the outer ring without touching, intersecting, overlapping, or nesting. A polygon accepts at most 4,096 normalized input vertices. Reassign `geometry` after in-place edits to compile a new snapshot, or assign `null` or `undefined` to clear the surface.

```html
<nve-scene-polygon
  color="white"
  geometry='{"outer":[[-2,-2],[2,-2],[2,2],[-2,2]],"holes":[[[-1,-1],[-1,1],[1,1],[1,-1]]]}'
></nve-scene-polygon>
```

Transparent Scene geometry uses weighted blended order-independent transparency across markers, streams, meshes, models, and height fields. Intersecting translucent surfaces no longer depend on layer order, although the weighted approximation does not reproduce exact sorted alpha blending. Cube markers can use a separate `outline-color`; streamed marker records use `outlineColor` while retaining the 48-byte marker stride.
