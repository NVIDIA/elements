// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/frame/define.js';

export default {
  title: 'Elements/Scene/Frame',
  component: 'nve-scene-frame'
};

/**
 * @summary Nested coordinate frames move robot geometry through timestamped poses. Scrub the timeline to see child frames inherit the interpolated robot transform.
 */
export const Default = {
  render: () => html`
    <div nve-layout="column gap:md full">
      <nve-scene aria-label="Robot coordinate frames" style="width: 100%; height: 480px">
        <p slot="fallback" nve-text="body">The 3D scene is unavailable.</p>
        <nve-scene-camera behavior="orbit" distance="6"></nve-scene-camera>
        <nve-scene-frame name="map">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-axes length="1.5"></nve-scene-axes>
          <nve-scene-frame name="base_link" id="robot">
            <nve-scene-axes></nve-scene-axes>
            <nve-scene-cubes>
              <nve-scene-marker position="[0,0,0.3]" scale="[1.2,0.7,0.5]" color="#76b900"></nve-scene-marker>
            </nve-scene-cubes>
            <nve-scene-frame name="lidar" position="[0.35,0,0.75]">
              <nve-scene-axes length="0.4"></nve-scene-axes>
              <nve-scene-spheres>
                <nve-scene-marker scale="[0.25,0.25,0.25]" color="#ffffff"></nve-scene-marker>
              </nve-scene-spheres>
            </nve-scene-frame>
          </nve-scene-frame>
        </nve-scene-frame>
      </nve-scene>
      <nve-range>
        <label for="frame-time">Scene time: <output id="frame-time-output" for="frame-time">0.0 s</output></label>
        <input id="frame-time" type="range" min="0" max="10000" step="100" value="0">
      </nve-range>
    </div>
    <script type="module">
      import '@nvidia-elements/scene/bundles/index.js';

      const scene = document.querySelector('nve-scene');
      const robot = document.querySelector('#robot');
      const timeline = document.querySelector('#frame-time');
      const timeOutput = document.querySelector('#frame-time-output');

      robot.setTransform({ stamp: 0, position: [-2, -1, 0], orientation: [0, 0, 0, 1] });
      robot.setTransform({ stamp: 5000, position: [0, 1, 0], orientation: [0, 0, 0.707, 0.707] });
      robot.setTransform({ stamp: 10000, position: [2, -1, 0], orientation: [0, 0, 1, 0] });
      scene.time = 0;

      timeline.addEventListener('input', () => {
        scene.time = timeline.valueAsNumber;
        timeOutput.value = (timeline.valueAsNumber / 1000).toFixed(1) + ' s';
      });
    </script>
  `
};
