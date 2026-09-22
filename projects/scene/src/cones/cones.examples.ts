// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/cones/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Cones',
  component: 'nve-scene-cones'
};

/**
 * @summary Cone instances compare three scales and CMY instance colors while preserving the positive z-axis tip direction. Use this pattern to distinguish magnitude or category in directional scene data.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="cones scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cones source='[{"position":[-2.5,0,0.75],"size":[0.75,0.75,1.5],"color":"cyan"},{"position":[0,0,1],"size":[1,1,2],"color":"magenta"},{"position":[2.5,0,1.5],"size":[1.5,1.5,3],"color":"yellow"}]'>
      </nve-scene-cones>
    </nve-scene>
  `
};

/**
 * @summary Cone instances supplied by a packed buffer reproduce the declarative scene. Use a ConeBuffer for large or frequently updated instance sets.
 */
export const BufferSource = {
  render: () => html`
    <nve-scene aria-label="buffered cones scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cones id="buffered-cones"></nve-scene-cones>
    </nve-scene>
    <script type="module">
      import { ConeBuffer } from '@nvidia-elements/scene/cones';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/cones/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const cones = new ConeBuffer({ capacity: 3 });
      cones.add({ position: [-2.5, 0, 0.75], size: [0.75, 0.75, 1.5], color: 'cyan' });
      cones.add({ position: [0, 0, 1], size: [1, 1, 2], color: 'magenta' });
      cones.add({ position: [2.5, 0, 1.5], size: [1.5, 1.5, 3], color: 'yellow' });
      document.querySelector('#buffered-cones').source = cones;
    </script>
  `
};
