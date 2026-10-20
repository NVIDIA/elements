// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/axes/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/frame/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/labels/define.js';
import '@nvidia-elements/scene/points/define.js';
import '@nvidia-elements/scene/scene/define.js';

export default {
  title: 'Elements/Scene/Frame',
  component: 'nve-scene-frame'
};

/**
 * @summary Place a sensor scan, axes, and label in one coordinate frame. Adjust the sensor heading to move them together while the world grid stays fixed and scan records keep their local coordinates.
 */
export const Default = {
  render: () => html`
    <div id="sensor-frame-demo" nve-layout="column gap:md pad:md">
      <nve-scene aria-label="Sensor scan in a movable coordinate frame" style="width: 100%; height: 400px">
        <nve-scene-camera behavior="orbit" target="[0,0,0.8]" distance="6" polar-angle="1" azimuth="-0.8"></nve-scene-camera>
        <nve-scene-gridlines spacing="0.5" count="6"></nve-scene-gridlines>
        <nve-scene-axes length="0.6"></nve-scene-axes>
        <nve-scene-frame id="sensor-frame" name="sensor" position="[-1,0,0.4]">
          <nve-scene-axes length="0.8" width="3"></nve-scene-axes>
          <nve-scene-points id="sensor-scan" size="5"></nve-scene-points>
        </nve-scene-frame>
        <nve-scene-labels id="sensor-label" frame="sensor"></nve-scene-labels>
      </nve-scene>
      <div nve-layout="column gap:xs">
        <label for="sensor-heading" nve-text="label">Sensor heading: <output id="sensor-heading-output" for="sensor-heading">25°</output></label>
        <input id="sensor-heading" type="range" min="-90" max="90" step="1" value="25" />
        <p nve-text="body sm muted">The scan, sensor axes, and label move together. The grid and world axes stay fixed.</p>
      </div>
    </div>
    <script type="module">
      import { LabelBuffer } from '@nvidia-elements/scene/labels';
      import { PointBuffer } from '@nvidia-elements/scene/points';
      import '@nvidia-elements/scene/axes/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/frame/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/labels/define.js';
      import '@nvidia-elements/scene/points/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const demo = document.querySelector('#sensor-frame-demo');
      const sensor = demo.querySelector('#sensor-frame');
      const heading = demo.querySelector('#sensor-heading');
      const headingOutput = demo.querySelector('#sensor-heading-output');
      const scan = new PointBuffer({ capacity: 286 });
      for (let row = 0; row < 11; row += 1) {
        for (let column = 0; column < 13; column += 1) {
          const index = (row * 13 + column) * 2;
          const height = row * 0.12;
          scan.set(index, { position: [1.8, -0.9 + column * 0.15, height], color: '#76b900' });
          scan.set(index + 1, { position: [0.6 + column * 0.1, 0.9, height], color: '#76b900' });
        }
      }
      demo.querySelector('#sensor-scan').source = scan;
      demo.querySelector('#sensor-label').source = new LabelBuffer({
        records: [{ text: 'Sensor scan', position: [1.8, 0, 1.4], scale: 18 }]
      });

      const updatePose = () => {
        const angle = heading.valueAsNumber * Math.PI / 180;
        sensor.position = [-1, 0, 0.4];
        sensor.orientation = [0, 0, Math.sin(angle / 2), Math.cos(angle / 2)];
        headingOutput.value = heading.value + '°';
      };
      heading.addEventListener('input', updatePose);
      updatePose();
    </script>
  `
};
