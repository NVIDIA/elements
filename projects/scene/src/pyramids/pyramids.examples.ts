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
 * @summary Pyramid markers compare three scales and CMY instance colors while preserving the positive z-axis apex direction. Use this pattern to distinguish magnitude or category in bounded scene data.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Pyramids scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-pyramids>
        <nve-scene-marker position="[-2.5,0,0.75]" scale="[0.75,0.75,1.5]" color="cyan"></nve-scene-marker>
        <nve-scene-marker position="[0,0,1]" scale="[1,1,2]" color="magenta"></nve-scene-marker>
        <nve-scene-marker position="[2.5,0,1.5]" scale="[1.5,1.5,3]" color="yellow"></nve-scene-marker>
      </nve-scene-pyramids>
    </nve-scene>
  `
};

/**
 * @summary Pyramid markers supplied by a packed buffer reproduce the declarative scene. Use a MarkerBuffer for large or frequently updated instance sets.
 */
export const BufferSource = {
  render: () => html`
    <nve-scene aria-label="buffered pyramids scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-pyramids id="buffered-pyramids"></nve-scene-pyramids>
    </nve-scene>
    <script type="module">
      import { MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/pyramids/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const markers = new MarkerBuffer({ capacity: 3 });
      markers.add({ position: [-2.5, 0, 0.75], scale: [0.75, 0.75, 1.5], color: 'cyan' });
      markers.add({ position: [0, 0, 1], scale: [1, 1, 2], color: 'magenta' });
      markers.add({ position: [2.5, 0, 1.5], scale: [1.5, 1.5, 3], color: 'yellow' });
      document.querySelector('#buffered-pyramids').source = markers;
    </script>
  `
};
