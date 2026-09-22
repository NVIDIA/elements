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
 * @summary Cylinder instances compare three scales and CMY instance colors while preserving the positive z-axis alignment. Use this pattern to distinguish magnitude or category in columnar scene data.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="cylinders scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cylinders source='[{"position":[-2.5,0,0.75],"size":[0.75,0.75,1.5],"color":"cyan"},{"position":[0,0,1],"size":[1,1,2],"color":"magenta"},{"position":[2.5,0,1.5],"size":[1.5,1.5,3],"color":"yellow"}]'>
      </nve-scene-cylinders>
    </nve-scene>
  `
};

/**
 * @summary Cylinder instances supplied by a packed buffer reproduce the declarative scene. Use a CylinderBuffer for large or frequently updated instance sets.
 */
export const BufferSource = {
  render: () => html`
    <nve-scene aria-label="buffered cylinders scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cylinders id="buffered-cylinders"></nve-scene-cylinders>
    </nve-scene>
    <script type="module">
      import { CylinderBuffer } from '@nvidia-elements/scene/cylinders';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/cylinders/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const cylinders = new CylinderBuffer({ capacity: 3 });
      cylinders.add({ position: [-2.5, 0, 0.75], size: [0.75, 0.75, 1.5], color: 'cyan' });
      cylinders.add({ position: [0, 0, 1], size: [1, 1, 2], color: 'magenta' });
      cylinders.add({ position: [2.5, 0, 1.5], size: [1.5, 1.5, 3], color: 'yellow' });
      document.querySelector('#buffered-cylinders').source = cylinders;
    </script>
  `
};
