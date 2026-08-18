# @nvidia-elements/scene

WebGPU-backed 3D Web Components for NVIDIA Elements. Use Scene for robotics, telemetry, simulation, and spatial UI where declarative DOM remains useful alongside streamed binary data.

## Install and register

```sh
pnpm add @nvidia-elements/scene
```

Import the root entrypoint for types, streaming layout helpers, and classes without registering any custom elements.

```ts
import { MARKER, writeMarker, type Scene } from '@nvidia-elements/scene';
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

`nve-scene` exposes its `aria-label` or `aria-labelledby` value to assistive technology and displays its `fallback` content if WebGPU is unavailable. Keep renderable layers, frames, camera behaviors, and labels as direct or frame-nested light-DOM descendants. A scene fails closed: an unavailable device, invalid layer, or unsupported label texture leaves that contribution inert instead of rendering misleading data. Handle bubbling `nve-scene-error` events for diagnostics.

## Data and animation

Use the exported layout descriptors and helpers to write user-owned binary buffers. `instances` accepts an `ArrayBufferView`, not an `ArrayBuffer`; wrap wire bytes in a typed view so stride math stays explicit. Mutate the view in place, then call `commit(start, count)` to upload the changed range.

```ts
import { MARKER, writeMarker } from '@nvidia-elements/scene';

const bytes = new Uint8Array(new ArrayBuffer(2 * MARKER.stride));
const view = new DataView(bytes.buffer);
writeMarker(view, 0, { position: [0, 0, 0.5], color: [0.46, 0.72, 0, 1] });
cubes.instances = bytes;
cubes.commit(0, 1);
```

Use `nve-scene-frame` for named transforms and timestamped samples. Set `scene.time` to a number to scrub or `'live'` for the newest samples. Repeat `nve-scene-camera` with `orbit`, `follow`, or `top` behaviors to combine camera contributions. Camera elements are authoritative: configure orbit targets, offsets, and projection with attributes or update the camera element's properties from JavaScript. `scene.cameraState` is a read-only resolved snapshot for inspection and camera-change events.

`scene.pick(clientX, clientY)` resolves a world-space hit. Declarative markers receive one synthetic pointer event; streamed layers receive `nve-scene-pick` with the instance index. Labels keep semantic DOM content and can reflect `stale` or `occluded` for document CSS. HTML-in-canvas label textures are capability-gated, so the accessible overlay remains the fallback path.

## Geometry

Use streamed `nve-scene-points`, `nve-scene-lines`, and `nve-scene-triangles` for wire-format overlays. Fixed marker layers (`arrows`, `cones`, `cubes`, `cylinders`, `pyramids`, and `spheres`) use `nve-scene-marker` children or a marker buffer. `nve-scene-mesh` accepts planar typed arrays; changing positions and normals with stable indices uses its upload-only path.

Point layers default to `size-unit="pixel"`, which interprets `size` in CSS pixels. Choose `size-unit="world"` for camera-facing points measured in scene units that grow or shrink with the camera projection.

Line records keep geometry and outgoing-segment style together. Choose `topology="strip"` for a connected path, `topology="loop"` to connect the last record to the first, or `topology="segments"` for independent record pairs. The default `width-unit="world"` interprets widths and dash patterns in scene units and uses each record's frame-local normal to orient the ribbon. Choose `width-unit="pixel"` to keep these values stable on screen.

```ts
import { LINE_VERTEX, writeLineVertex } from '@nvidia-elements/scene';

const vertices = new Uint8Array(3 * LINE_VERTEX.stride);
writeLineVertex(vertices, 0, {
  position: [-1, 0, 0],
  color: [0.46, 0.72, 0, 1],
  width: 0.1,
  dash: 0.2,
  gap: 0.1
});
writeLineVertex(vertices, 1, { position: [0, 1, 0], width: 0 }); // Break the path after this vertex.
writeLineVertex(vertices, 2, { position: [1, 0, 0] });
lines.vertices = vertices;
```

Each record styles the segment that starts at its position. A zero width creates a break, and a zero gap produces a solid segment. Dash patterns restart and center on each segment. The helper defaults to a `0.1` scene-unit solid line with a `[0, 0, 1]` normal, so position-only records remain useful as segment endpoints.

`nve-scene-heightfield` renders a uniform terrain grid and provides local height, normal, slope, and drape queries. `nve-scene-model` compiles `nve-scene-part` children or a `parts` array into one mesh. Part edits rebuild geometry; animate model instances through markers or ancestor frames instead. `nve-scene-gridlines` and `nve-scene-axes` provide non-pickable frame-local reference geometry.

Transparent Scene geometry uses weighted blended order-independent transparency across markers, streams, meshes, models, and height fields. Intersecting translucent surfaces no longer depend on layer order, although the weighted approximation does not reproduce exact sorted alpha blending. Cube markers can use a separate `outline-color`; streamed marker records use `outlineColor` while retaining the 48-byte marker stride.
