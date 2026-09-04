// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/cylinders/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Cylinders',
  component: 'nve-scene-cylinders'
};

/**
 * @summary Cylinder markers compare three scales and CMY instance colors while preserving the positive z-axis alignment. Use this pattern to distinguish magnitude or category in columnar scene data.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="cylinders scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cylinders>
        <nve-scene-marker position="[-2.5,0,0.75]" scale="[0.75,0.75,1.5]" color="cyan"></nve-scene-marker>
        <nve-scene-marker position="[0,0,1]" scale="[1,1,2]" color="magenta"></nve-scene-marker>
        <nve-scene-marker position="[2.5,0,1.5]" scale="[1.5,1.5,3]" color="yellow"></nve-scene-marker>
      </nve-scene-cylinders>
    </nve-scene>
  `
};

/**
 * @summary Cylinder markers supplied by a packed buffer reproduce the declarative scene. Use a MarkerBuffer for large or frequently updated instance sets.
 */
export const BufferSource = {
  render: () => html`
    <nve-scene aria-label="buffered cylinders scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cylinders id="buffered-cylinders"></nve-scene-cylinders>
    </nve-scene>
    <script type="module">
      import { MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/cylinders/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const markers = new MarkerBuffer({ capacity: 3 });
      markers.add({ position: [-2.5, 0, 0.75], scale: [0.75, 0.75, 1.5], color: 'cyan' });
      markers.add({ position: [0, 0, 1], scale: [1, 1, 2], color: 'magenta' });
      markers.add({ position: [2.5, 0, 1.5], scale: [1.5, 1.5, 3], color: 'yellow' });
      document.querySelector('#buffered-cylinders').source = markers;
    </script>
  `
};
