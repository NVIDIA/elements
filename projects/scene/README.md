# @nvidia-elements/scene

WebGPU-backed 3D Web Components for NVIDIA Elements. Scene is a curated, high-performance visualization foundation for operator-facing robotics and spatial-monitoring applications.

Scene uses declarative Web Components for stable scene structure and packed data paths for frequently updated geometry. Use it to display the current state of robots, facilities, telemetry, perception output, and spatial annotations.

The application owns transport, timing, buffering, interpolation, replay, and the selection of one coherent current snapshot. Scene owns snapshot validation, scene-local frame composition, GPU resources, rendering, vector labels, picking, and device recovery. Scene does not store transform history or synchronize independent assignments. Prepare an atomic update before assigning its transforms, sensor buffers, and annotations. See the [Scene documentation](https://nvidia.github.io/elements/docs/scene/) for public usage and the [architecture guide](ARCHITECTURE.md) for contributor responsibilities and feature boundaries.

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
import '@nvidia-elements/scene/labels/define.js';
```

## First scene

```html
<nve-scene aria-label="visualization" style="height: 480px">
  <nve-scene-gridlines></nve-scene-gridlines>
  <nve-scene-axes></nve-scene-axes>
  <nve-scene-cubes id="cubes">
    <nve-scene-marker position="[0,0,0.5]" color="#76b900"></nve-scene-marker>
  </nve-scene-cubes>
  <nve-scene-labels id="labels"></nve-scene-labels>
</nve-scene>

<script type="module">
  import { LabelBuffer, MarkerBuffer } from '@nvidia-elements/scene';

  const markers = new MarkerBuffer({ capacity: 2 });
  const labels = new LabelBuffer({ capacity: 1 });
  const cube = markers.add({ color: 'rgb(118 185 0)' });
  labels.add({ color: 'white', position: [0, 0, 1.4], scale: 18, text: 'origin cube' });
  cube.position.set(0, 0, 0.5);
  document.querySelector('#cubes').source = markers;
  document.querySelector('#labels').source = labels;
  cube.position.z = 1;
  document.querySelector('#cubes').publish({ count: 1, start: 0 });
</script>
```
