// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/arrows/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Arrows',
  component: 'nve-scene-arrows'
};

/**
 * @summary Arrows show a small vector field with CMY instance colors. Use JSON source records for small, static vector annotations.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="arrows scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-arrows
        source='[{"origin":[-2.5,-0.4,0],"vector":[1,0,1.5],"shaftDiameter":0.1,"color":"cyan"},{"origin":[0,0,0],"vector":[0,0.75,2],"shaftDiameter":0.1,"color":"magenta"},{"origin":[2.5,0.4,0],"vector":[-1,-0.4,2.2],"shaftDiameter":0.1,"color":"yellow"}]'
      ></nve-scene-arrows>
    </nve-scene>
  `
};

/**
 * @summary Arrows supplied by a packed buffer reproduce the static scene. Use an ArrowBuffer for large or frequently updated vector fields.
 */
export const BufferSource = {
  render: () => html`
    <nve-scene aria-label="buffered arrows scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-arrows id="buffered-arrows"></nve-scene-arrows>
    </nve-scene>
    <script type="module">
      import { ArrowBuffer } from '@nvidia-elements/scene/arrows';
      import '@nvidia-elements/scene/arrows/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const markers = new ArrowBuffer({
        records: [
          { origin: [-2.5, -0.4, 0], vector: [1, 0, 1.5], shaftDiameter: 0.1, color: 'cyan', featureId: 10 },
          { origin: [0, 0, 0], vector: [0, 0.75, 2], shaftDiameter: 0.1, color: 'magenta', featureId: 11 },
          { origin: [2.5, 0.4, 0], vector: [-1, -0.4, 2.2], shaftDiameter: 0.1, color: 'yellow', featureId: 12 }
        ]
      });
      document.querySelector('#buffered-arrows').source = markers;
    </script>
  `
};
