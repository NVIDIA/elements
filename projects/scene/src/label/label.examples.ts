// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/cubes/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/label/define.js';

export default {
  title: 'Elements/Scene/Label',
  component: 'nve-scene-label'
};

/**
 * @summary Two scene labels identify separate cubes while preserving semantic DOM content. Use independent labels to clarify distinct objects in a visualization.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Labeled cubes">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes>
        <nve-scene-marker position="[-2,0,0.75]" scale="[1.5,1.5,1.5]" color="#76b900"></nve-scene-marker>
        <nve-scene-marker position="[2,0,1]" scale="[2,2,2]" color="#25aee9"></nve-scene-marker>
      </nve-scene-cubes>
      <nve-scene-label anchor="bottom" offset="[0,-8]" position="[-2,0,1.5]">
        <span nve-text="body">Cube A</span>
      </nve-scene-label>
      <nve-scene-label anchor="bottom" offset="[0,-8]" position="[2,0,2]">
        <span nve-text="body">Cube B</span>
      </nve-scene-label>
    </nve-scene>
  `
};

/**
 * @summary React to reflected label state and update the authoritative orbit camera element. Use this pattern when a control changes the camera while label styling remains in document CSS.
 * @tags theme
 */
export const CssState = {
  render: () => html`
    <style>
      nve-scene-label[stale] .callout { opacity: 0.4; }
      nve-scene-label[occluded] .callout { opacity: 0.25; }
    </style>
    <button id="overview-toggle" type="button">Toggle overview</button>
    <nve-scene id="label-state-scene" aria-label="Label state and camera controls">
      <nve-scene-camera behavior="orbit" distance="45" phi="0.15" theta="0"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-label position="[0,0,1]"><span class="callout">origin</span></nve-scene-label>
    </nve-scene>
    <script type="module">
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/label/define.js';

      const camera = document.querySelector('#label-state-scene nve-scene-camera');
      const setCamera = (distance, phi) => {
        camera.target = [0, 0, 0];
        camera.heading = 0;
        camera.distance = distance;
        camera.phi = phi;
        camera.theta = 0;
        camera.projection = 'perspective';
        camera.fovy = Math.PI / 4;
      };
      let overview = true;
      setCamera(45, 0.15);
      document.querySelector('#overview-toggle').addEventListener('click', () => {
        overview = !overview;
        setCamera(overview ? 45 : 18, overview ? 0.15 : 0.8);
      });
    </script>
  `
};
