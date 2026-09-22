// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/spheres/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Spheres',
  component: 'nve-scene-spheres'
};

/**
 * @summary Sphere instances compare three uniform scales and CMY instance colors. Use this pattern to distinguish categories while communicating relative radial extent in scene data.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="spheres scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-spheres source='[{"position":[-2.5,0,0.375],"size":[0.75,0.75,0.75],"color":"cyan"},{"position":[0,0,0.5],"size":[1,1,1],"color":"magenta"},{"position":[2.5,0,0.75],"size":[1.5,1.5,1.5],"color":"yellow"}]'>
      </nve-scene-spheres>
    </nve-scene>
  `
};

/**
 * @summary Sphere instances supplied by a packed buffer reproduce the declarative scene. Use a SphereBuffer for large or frequently updated instance sets.
 */
export const BufferSource = {
  render: () => html`
    <nve-scene aria-label="buffered spheres scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-spheres id="buffered-spheres"></nve-scene-spheres>
    </nve-scene>
    <script type="module">
      import { SphereBuffer } from '@nvidia-elements/scene/spheres';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/spheres/define.js';

      const spheres = new SphereBuffer({ capacity: 3 });
      spheres.add({ position: [-2.5, 0, 0.375], size: [0.75, 0.75, 0.75], color: 'cyan' });
      spheres.add({ position: [0, 0, 0.5], size: [1, 1, 1], color: 'magenta' });
      spheres.add({ position: [2.5, 0, 0.75], size: [1.5, 1.5, 1.5], color: 'yellow' });
      document.querySelector('#buffered-spheres').source = spheres;
    </script>
  `
};
