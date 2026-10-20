// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/scene/frame/define.js';
import '@nvidia-elements/scene/lines/define.js';
import '@nvidia-elements/scene/joint/define.js';
import '@nvidia-elements/scene/model/define.js';
import '@nvidia-elements/scene/body/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/labels/define.js';

export default { title: 'Elements/Scene/Joint', component: 'nve-scene-joint' };

/**
 * @summary Adjust two pendulum joints in radians. Moving beyond the first joint's limits applies the value and displays the joint-limit diagnostic.
 */
export const Default = {
  render: () => html`
    <div id="pendulum" style="height:100%;display:grid;grid-template-rows:1fr auto">
      <nve-scene aria-label="Two joint pendulum">
        <nve-scene-camera behavior="orbit" target="[0,0,-1]" distance="6" polar-angle="1.57" azimuth="-1.57"></nve-scene-camera>
        <nve-scene-model name="pendulum">
        <nve-scene-body name="base"></nve-scene-body>
        <nve-scene-joint name="shoulder" parent="base" child="upper_arm" axis="[0,1,0]" lower="-1" upper="1"></nve-scene-joint>
        <nve-scene-joint name="elbow" parent="upper_arm" child="forearm" axis="[0,1,0]" position="[0,0,-1]"></nve-scene-joint>
        <nve-scene-body name="upper_arm"><nve-scene-shape position="[0,0,-0.5]" scale="[0.12,0.12,1]" color="#76b900"></nve-scene-shape></nve-scene-body>
        <nve-scene-body name="forearm"><nve-scene-shape position="[0,0,-0.5]" scale="[0.12,0.12,1]" color="#8f97a6"></nve-scene-shape></nve-scene-body>
        <nve-scene-frame name="tip" frame="forearm" position="[0,0,-1]"></nve-scene-frame>
        <nve-scene-labels frame="tip" source='[{"text":"Tip","scale":18}]'></nve-scene-labels>
        </nve-scene-model>
      </nve-scene>
      <div nve-layout="grid span-items:6 gap:sm pad:md">
        <nve-range>
          <label for="pendulum-shoulder">Shoulder (rad)</label>
          <input id="pendulum-shoulder" data-joint="shoulder" type="range" min="-1.5" max="1.5" step="0.01" value="0" />
        </nve-range>
        <nve-range>
          <label for="pendulum-elbow">Elbow (rad)</label>
          <input id="pendulum-elbow" data-joint="elbow" type="range" min="-1.5" max="1.5" step="0.01" value="0" />
        </nve-range>
        <output aria-live="polite"></output>
      </div>
      <script type="module">
        import '@nvidia-elements/core/range/define.js';

        const root = document.querySelector('#pendulum');
        root.addEventListener('input', event => {
          const name = event.target.dataset.joint;
          if (name) root.querySelector('nve-scene-model').joints.set(name, event.target.valueAsNumber);
        });
        root.addEventListener('nve-scene-error', event => {
          if (event.detail.code === 'joint-limit') root.querySelector('output').textContent = 'joint-limit: value applied outside the configured limits';
        });
      </script>
    </div>
  `
};

/**
 * @summary Lift a forklift carriage, forks, pallet, and load with one prismatic joint. Group fixed geometry into rigid bodies and drive lift height in meters through the model's joints.
 */
export const Forklift = {
  render: () => html`
    <div id="forklift-demo" nve-layout="column gap:md pad:md">
      <nve-scene aria-label="Forklift lifting a pallet" style="width: 100%; height: 480px">
        <nve-scene-camera behavior="orbit" target="[0.25,0,0.75]" distance="6"></nve-scene-camera>
        <nve-scene-gridlines></nve-scene-gridlines>
        <nve-scene-model name="forklift" position="[-0.75,0,0]">
          <nve-scene-joint name="lift" parent="chassis" child="carriage" type="prismatic" axis="[0,0,1]" position="[0.4,0,0]" value="0.25" lower="0.25" upper="1.25"></nve-scene-joint>
          <nve-scene-body name="chassis">
            <nve-scene-shape type="cube" position="[-0.3,0,0.3]" scale="[1.2,0.9,0.5]" color="#76b900"></nve-scene-shape>
            <nve-scene-shape type="cube" position="[-0.55,0,0.72]" scale="[0.55,0.8,0.55]" color="#30343b"></nve-scene-shape>
            <nve-scene-shape type="cube" position="[0.35,-0.34,0.85]" scale="[0.12,0.12,1.5]" color="#aeb4be"></nve-scene-shape>
            <nve-scene-shape type="cube" position="[0.35,0.34,0.85]" scale="[0.12,0.12,1.5]" color="#aeb4be"></nve-scene-shape>
            <nve-scene-shape type="cylinder" position="[-0.65,-0.5,0.2]" orientation="[0.707107,0,0,0.707107]" scale="[0.4,0.4,0.18]" color="#20242a"></nve-scene-shape>
            <nve-scene-shape type="cylinder" position="[-0.65,0.5,0.2]" orientation="[0.707107,0,0,0.707107]" scale="[0.4,0.4,0.18]" color="#20242a"></nve-scene-shape>
            <nve-scene-shape type="cylinder" position="[0.15,-0.5,0.2]" orientation="[0.707107,0,0,0.707107]" scale="[0.4,0.4,0.18]" color="#20242a"></nve-scene-shape>
            <nve-scene-shape type="cylinder" position="[0.15,0.5,0.2]" orientation="[0.707107,0,0,0.707107]" scale="[0.4,0.4,0.18]" color="#20242a"></nve-scene-shape>
          </nve-scene-body>
          <nve-scene-body name="carriage">
            <nve-scene-shape type="cube" position="[0,0,0.2]" scale="[0.15,0.8,0.45]" color="#aeb4be"></nve-scene-shape>
            <nve-scene-shape type="cube" position="[0.5,-0.28,0]" scale="[1,0.1,0.08]" color="#aeb4be"></nve-scene-shape>
            <nve-scene-shape type="cube" position="[0.5,0.28,0]" scale="[1,0.1,0.08]" color="#aeb4be"></nve-scene-shape>
            <nve-scene-shape type="cube" position="[0.7,0,0.14]" scale="[0.8,0.75,0.18]" color="#d97736"></nve-scene-shape>
            <nve-scene-shape type="cube" position="[0.7,0,0.55]" scale="[0.7,0.65,0.65]" color="#e8eaed"></nve-scene-shape>
          </nve-scene-body>
        </nve-scene-model>
      </nve-scene>
      <nve-range>
        <label for="lift-height">Lift height: <output id="lift-height-output" for="lift-height">0.25 m</output></label>
        <input id="lift-height" type="range" min="0.25" max="1.25" step="0.05" value="0.25" />
      </nve-range>
    </div>
    <script type="module">
      import '@nvidia-elements/core/range/define.js';
      import '@nvidia-elements/scene/body/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/joint/define.js';
      import '@nvidia-elements/scene/model/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const demo = document.querySelector('#forklift-demo');
      const forklift = demo.querySelector('nve-scene-model');
      const liftHeight = demo.querySelector('#lift-height');
      const liftHeightOutput = demo.querySelector('#lift-height-output');
      liftHeight.addEventListener('input', () => {
        const height = liftHeight.valueAsNumber;
        forklift.joints.set('lift', height);
        liftHeightOutput.value = height.toFixed(2) + ' m';
      });
    </script>
  `
};

/**
 * @summary Drive two copies of one arm template independently with separate sliders. Each model reuses the same internal joint names, while an orbit camera keeps both arms in view.
 */
export const IndependentArms = {
  render: () => html`
    <div id="independent-arms" style="height:100%;display:grid;grid-template-rows:1fr auto">
      <nve-scene aria-label="Two independent arms">
        <nve-scene-camera behavior="orbit" target="[0,0,1]" distance="6" polar-angle="1.1" azimuth="-0.8"></nve-scene-camera>
        ${['armA', 'armB'].map(
          (name, index) => html`
          <nve-scene-model name=${name} position=${JSON.stringify([index * 2 - 1, 0, 0])} tint=${index ? '#76b900' : '#8f97a6'}>
            <nve-scene-body name="base"></nve-scene-body>
            <nve-scene-joint name="shoulder" parent="base" child="upper_arm" axis="[0,1,0]" position="[0,0,0.2]"></nve-scene-joint>
            <nve-scene-joint name="elbow" parent="upper_arm" child="forearm" axis="[0,1,0]" position="[0,0,1]"></nve-scene-joint>
            <nve-scene-frame name="tcp" frame="forearm" position="[0,0,0.8]"></nve-scene-frame>
            <nve-scene-body name="upper_arm"><nve-scene-shape position="[0,0,0.5]" scale="[0.15,0.15,1]"></nve-scene-shape></nve-scene-body>
            <nve-scene-body name="forearm"><nve-scene-shape position="[0,0,0.4]" scale="[0.12,0.12,0.8]"></nve-scene-shape></nve-scene-body>
          </nve-scene-model>
        `
        )}
      </nve-scene>
      <div nve-layout="grid span-items:6 gap:sm pad:md">
        <nve-range>
          <label for="arm-a-angle">Arm A (rad)</label>
          <input id="arm-a-angle" data-model="armA" type="range" min="-1.5" max="1.5" step="0.01" value="0" />
        </nve-range>
        <nve-range>
          <label for="arm-b-angle">Arm B (rad)</label>
          <input id="arm-b-angle" data-model="armB" type="range" min="-1.5" max="1.5" step="0.01" value="0" />
        </nve-range>
      </div>
      <script type="module">
        import '@nvidia-elements/core/range/define.js';

        const root = document.querySelector('#independent-arms');
        root.addEventListener('input', event => {
          const model = root.querySelector('nve-scene-model[name="' + event.target.dataset.model + '"]');
          if (model) {
            model.joints.set({ shoulder: event.target.valueAsNumber, elbow: -event.target.valueAsNumber / 2 });
          }
        });
      </script>
    </div>
  `
};
