// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/media/time-range/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/frame/define.js';

export default {
  title: 'Elements/Scene/Frame',
  component: 'nve-scene-frame'
};

/**
 * @summary A forklift carriage groups the forks, pallet, and load under one moving frame. Use nested frames to update an articulated assembly while preserving each part's local offset.
 */
export const Default = {
  render: () => html`
    <div nve-layout="column gap:md pad:md">
      <nve-scene aria-label="Forklift lifting a pallet" style="width: 100%; height: 480px">
        <nve-scene-camera behavior="orbit" target="[0.25,0,0.75]" distance="6"></nve-scene-camera>
        <nve-scene-frame name="warehouse">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-frame name="forklift" position="[-0.75,0,0]">
            <nve-scene-cubes>
              <nve-scene-marker position="[-0.3,0,0.3]" scale="[1.2,0.9,0.5]" color="#76b900"></nve-scene-marker>
              <nve-scene-marker position="[-0.55,0,0.72]" scale="[0.55,0.8,0.55]" color="#30343b"></nve-scene-marker>
              <nve-scene-marker position="[0.35,-0.34,0.85]" scale="[0.12,0.12,1.5]" color="#aeb4be"></nve-scene-marker>
              <nve-scene-marker position="[0.35,0.34,0.85]" scale="[0.12,0.12,1.5]" color="#aeb4be"></nve-scene-marker>
            </nve-scene-cubes>
            <nve-scene-cylinders>
              <nve-scene-marker position="[-0.65,-0.5,0.2]" orientation="[0.707107,0,0,0.707107]" scale="[0.4,0.4,0.18]" color="#20242a"></nve-scene-marker>
              <nve-scene-marker position="[-0.65,0.5,0.2]" orientation="[0.707107,0,0,0.707107]" scale="[0.4,0.4,0.18]" color="#20242a"></nve-scene-marker>
              <nve-scene-marker position="[0.15,-0.5,0.2]" orientation="[0.707107,0,0,0.707107]" scale="[0.4,0.4,0.18]" color="#20242a"></nve-scene-marker>
              <nve-scene-marker position="[0.15,0.5,0.2]" orientation="[0.707107,0,0,0.707107]" scale="[0.4,0.4,0.18]" color="#20242a"></nve-scene-marker>
            </nve-scene-cylinders>
            <nve-scene-frame id="carriage" name="carriage" position="[0.4,0,0.25]">
              <nve-scene-cubes>
                <nve-scene-marker position="[0,0,0.2]" scale="[0.15,0.8,0.45]" color="#aeb4be"></nve-scene-marker>
                <nve-scene-marker position="[0.5,-0.28,0]" scale="[1,0.1,0.08]" color="#aeb4be"></nve-scene-marker>
                <nve-scene-marker position="[0.5,0.28,0]" scale="[1,0.1,0.08]" color="#aeb4be"></nve-scene-marker>
                <nve-scene-marker position="[0.7,0,0.14]" scale="[0.8,0.75,0.18]" color="#d97736"></nve-scene-marker>
                <nve-scene-marker position="[0.7,0,0.55]" scale="[0.7,0.65,0.65]" color="#e8eaed"></nve-scene-marker>
              </nve-scene-cubes>
            </nve-scene-frame>
          </nve-scene-frame>
        </nve-scene-frame>
      </nve-scene>
      <div nve-layout="column gap:xs">
        <label for="lift-height" nve-text="label">Lift height: <output id="lift-height-output" for="lift-height">0.25 m</output></label>
        <nve-media-time-range id="lift-height" aria-label="Lift height" min="0.25" max="1.25" step="0.05" value="0.25"></nve-media-time-range>
      </div>
    </div>
    <script type="module">
      import '@nvidia-elements/scene/bundles/index.js';
      const carriage = document.querySelector('#carriage');
      const liftHeight = document.querySelector('#lift-height');
      const liftHeightOutput = document.querySelector('#lift-height-output');
      liftHeight.addEventListener('input', () => {
        carriage.setPose({ position: [0.4, 0, liftHeight.valueAsNumber], orientation: [0, 0, 0, 1] });
        liftHeightOutput.value = liftHeight.valueAsNumber.toFixed(2) + ' m';
      });
    </script>
  `
};
