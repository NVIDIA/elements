// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/pyramids/define.js';

export default {
  title: 'Elements/Scene/Pyramids',
  component: 'nve-scene-pyramids'
};

/**
 * @summary Pyramid instances compare three scales and CMY instance colors while preserving the positive z-axis apex direction. Use this pattern to distinguish magnitude or category in bounded scene data.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Pyramids scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-pyramids source='[{"position":[-2.5,0,0.75],"size":[0.75,0.75,1.5],"color":"cyan"},{"position":[0,0,1],"size":[1,1,2],"color":"magenta"},{"position":[2.5,0,1.5],"size":[1.5,1.5,3],"color":"yellow"}]'>
      </nve-scene-pyramids>
    </nve-scene>
  `
};

/**
 * @summary Pyramid instances supplied by a packed buffer reproduce the declarative scene. Use a PyramidBuffer for large or frequently updated instance sets.
 */
export const BufferSource = {
  render: () => html`
    <nve-scene aria-label="buffered pyramids scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-pyramids id="buffered-pyramids"></nve-scene-pyramids>
    </nve-scene>
    <script type="module">
      import { PyramidBuffer } from '@nvidia-elements/scene/pyramids';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/pyramids/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const pyramids = new PyramidBuffer({ capacity: 3 });
      pyramids.add({ position: [-2.5, 0, 0.75], size: [0.75, 0.75, 1.5], color: 'cyan' });
      pyramids.add({ position: [0, 0, 1], size: [1, 1, 2], color: 'magenta' });
      pyramids.add({ position: [2.5, 0, 1.5], size: [1.5, 1.5, 3], color: 'yellow' });
      document.querySelector('#buffered-pyramids').source = pyramids;
    </script>
  `
};
