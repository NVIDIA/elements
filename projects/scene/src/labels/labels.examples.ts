// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/labels/define.js';

export default {
  title: 'Elements/Scene/Labels',
  component: 'nve-scene-labels'
};

/**
 * @summary Colored labels identify positions in a 3D scene. Use packed records for annotations that remain readable while the camera moves.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Labeled positions" style="min-height: 480px">
      <nve-scene-camera behavior="orbit" distance="7"></nve-scene-camera>
      <nve-scene-gridlines count="8"></nve-scene-gridlines>
      <nve-scene-labels id="example-labels"></nve-scene-labels>
    </nve-scene>
    <script type="module">
      import { LabelBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/labels/define.js';

      const labels = new LabelBuffer({ capacity: 3 });
      labels.add({ text: 'origin', position: [0, 0, 0.1], scale: 18, color: 'white' });
      labels.add({ text: 'sensor', position: [-2, 1, 1], scale: 20, color: 'cyan' });
      labels.add({ text: 'target', position: [2, -1, 1.5], scale: 24, color: 'yellow' });
      document.querySelector('#example-labels').source = labels;
    </script>
  `
};

/**
 * @summary Display-stable and spatial scales support both interface annotations and measurements tied to scene geometry.
 */
export const ScaleUnits = {
  render: () => html`
    <nve-scene aria-label="Label scale units" style="min-height: 480px">
      <nve-scene-camera behavior="orbit" distance="8"></nve-scene-camera>
      <nve-scene-gridlines count="8"></nve-scene-gridlines>
      <nve-scene-labels id="pixel-label"></nve-scene-labels>
      <nve-scene-labels id="world-label" scale-unit="world"></nve-scene-labels>
    </nve-scene>
    <script type="module">
      import { LabelBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/labels/define.js';

      const pixel = new LabelBuffer({ capacity: 1 });
      const world = new LabelBuffer({ capacity: 1 });
      pixel.add({ text: 'pixel', position: [-1.5, 0, 0.1], scale: 24, color: 'cyan' });
      world.add({ text: 'world', position: [1.5, 0, 0.1], scale: 0.5, color: 'magenta' });
      document.querySelector('#pixel-label').source = pixel;
      document.querySelector('#world-label').source = world;
    </script>
  `
};
