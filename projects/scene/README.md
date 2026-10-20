# @nvidia-elements/scene

WebGPU-backed 3D Web Components for NVIDIA Elements. Scene is a curated, high-performance visualization foundation for operator-facing robotics and spatial-monitoring applications.

Scene uses declarative Web Components for stable scene structure and packed data paths for frequently updated geometry. Use it to display the current state of robots, facilities, telemetry, perception output, and spatial annotations.

The application owns transport, timing, buffering, interpolation, replay, and the selection of one coherent current snapshot. Scene owns snapshot validation, scene-local frame composition, GPU resources, rendering, vector labels, picking, and device recovery. Scene does not store transform history or synchronize independent assignments. Prepare an atomic update before assigning its transforms, sensor buffers, and annotations. See the [Scene documentation](https://nvidia.github.io/elements/docs/scene/) for public usage and the [architecture guide](ARCHITECTURE.md) for contributor responsibilities and feature boundaries.

## Install and register

```sh
pnpm add @nvidia-elements/scene
```

Import the root entrypoint for shared types, canonical packed wire-format descriptors, and buffer classes. Import element classes from their standalone entrypoints.

```ts
import { MarkerBuffer } from '@nvidia-elements/scene';
import type { Scene } from '@nvidia-elements/scene/scene';
```

Import one `define.js` entrypoint when an app uses a specific element. It registers that element and its required Scene dependencies.

```ts
import '@nvidia-elements/scene/axes/define.js';
import '@nvidia-elements/scene/cubes/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/labels/define.js';
```

## First scene

A body is one rigid compound of shapes and meshes. Assign `geometry` or author shape and mesh children; use a mesh
child's `src` when geometry comes from a file. The URL extension selects a lazily loaded decoder; Scene ships STL support.

```html
<nve-scene aria-label="Robot base" style="height: 480px">
  <nve-scene-camera behavior="orbit" target="[0,0,0.3]" distance="3"></nve-scene-camera>
  <nve-scene-gridlines></nve-scene-gridlines>
  <nve-scene-body tint="#76b900">
    <nve-scene-shape type="cylinder" position="[0,0,0.15]" scale="[0.58,0.58,0.3]"></nve-scene-shape>
  </nve-scene-body>
</nve-scene>
```

```ts
import '@nvidia-elements/scene/body/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
```

Load a rigid visual from a file with a mesh part:

```html
<nve-scene-body>
  <nve-scene-mesh src="/bodies/robot-base.stl" color="#76b900"></nve-scene-mesh>
  <nve-scene-mesh src="/bodies/robot-motor.stl" position="[0,0,0.1]" color="#222326"></nve-scene-mesh>
</nve-scene-body>
```

```ts
import '@nvidia-elements/scene/mesh/define.js';
```

The fragment supports future sub-asset selection and passes unchanged to the decoder. STL ignores it.
Await `body.loadComplete` for decoded and captured geometry from every mesh part.

## A model with two joints

A model is the whole entity. A body owns a coordinate frame and rigid visual geometry, corresponding to a URDF
link. A joint names its parent and child bodies and defines their relative motion. Bodies and joints can remain
siblings in the DOM; explicit connections define the kinematic tree. Each model scopes body and joint names
independently, so a body and a joint can share a name, and two models can reuse internal names.

```html
<nve-scene aria-label="Articulated arm" style="height: 480px">
  <nve-scene-camera behavior="orbit" target="[0,0,1]" distance="4"></nve-scene-camera>
  <nve-scene-model name="arm">
    <nve-scene-body name="base"></nve-scene-body>
    <nve-scene-joint name="shoulder" parent="base" child="upper_arm" axis="[0,1,0]" value="0.3"></nve-scene-joint>
    <nve-scene-joint name="elbow" parent="upper_arm" child="forearm" axis="[0,1,0]" position="[0,0,1]" value="-0.6"></nve-scene-joint>
    <nve-scene-body name="upper_arm"><nve-scene-shape position="[0,0,0.5]" scale="[0.1,0.1,1]"></nve-scene-shape></nve-scene-body>
    <nve-scene-body name="forearm"><nve-scene-shape position="[0,0,0.4]" scale="[0.1,0.1,0.8]"></nve-scene-shape></nve-scene-body>
  </nve-scene-model>
</nve-scene>
```

```ts
import '@nvidia-elements/scene/model/define.js';
import '@nvidia-elements/scene/joint/define.js';
import '@nvidia-elements/scene/body/define.js';
import '@nvidia-elements/scene/camera/define.js';

const arm = document.querySelector('nve-scene-model')!;
arm.joints.set('elbow', -0.8); // radians, applied synchronously
arm.joints.set({ shoulder: 0.4, elbow: -0.8 }); // one lookup for every joint in the record
const tip = arm.bodies.get('forearm')?.getWorldPoint([0, 0, 0.8]);
```

Joint position and orientation define the origin in parent-body coordinates. The child body's world pose is
`parent body × joint origin × joint motion`. Root bodies inherit the model placement. Each child accepts one
incoming joint; missing bodies, competing connections, cycles, and a child `frame` override report
`joint-connection` and suppress the affected chain. Endpoints must name bodies in the same model scope.

Use `body.getWorldMatrix()`, `body.getWorldPoint()`, and `body.getLocalPoint()` for body-frame queries. An empty
body remains a valid reference frame. Other `nve-scene-frame` elements can attach sensors or tool frames
with `frame="forearm"`. Geometry offsets belong to shapes or geometry nodes inside the body.

This API represents visual geometry and kinematics. It does not simulate mass, inertia, or contact dynamics.
