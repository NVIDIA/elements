// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/joint/define.js';
import '@nvidia-elements/scene/model/define.js';
import '@nvidia-elements/scene/body/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/labels/define.js';

export default { title: 'Elements/Scene/Joint', component: 'nve-scene-joint' };

/**
 * @summary Rotate a rigid link about a joint's local axis. Use a declarative value in radians to position an articulated body without computing its pose in application code.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Revolute joint with an attached link" style="height: 100%">
      <nve-scene-camera behavior="orbit" target="[0.25,0,0.5]" distance="3" polar-angle="1.1" azimuth="-0.8"></nve-scene-camera>
      <nve-scene-model name="arm">
        <nve-scene-joint name="shoulder" type="revolute" axis="[0,1,0]" value="0.5"></nve-scene-joint>
        <nve-scene-body frame="shoulder">
          <nve-scene-shape kind="cylinder" position="[0,0,0.5]" scale="[0.12,0.12,1]" color="#76b900"></nve-scene-shape>
        </nve-scene-body>
      </nve-scene-model>
    </nve-scene>
  `
};

/**
 * @summary Adjust two pendulum joints in radians. Moving beyond the first joint's limits applies the value and displays the joint-limit diagnostic.
 */
export const Pendulum = {
  render: () => html`
    <div id="pendulum" style="height:100%;display:grid;grid-template-rows:1fr auto">
      <nve-scene aria-label="Two joint pendulum">
        <nve-scene-camera behavior="orbit" target="[0,0,-1]" distance="6" polar-angle="1.57" azimuth="-1.57"></nve-scene-camera>
        <nve-scene-model name="pendulum">
        <nve-scene-joint name="shoulder" axis="[0,1,0]" lower="-1" upper="1"></nve-scene-joint>
        <nve-scene-joint name="elbow" frame="shoulder" axis="[0,1,0]" position="[0,0,-1]"></nve-scene-joint>
        <nve-scene-body frame="shoulder"><nve-scene-shape position="[0,0,-0.5]" scale="[0.12,0.12,1]" color="#76b900"></nve-scene-shape></nve-scene-body>
        <nve-scene-body frame="elbow"><nve-scene-shape position="[0,0,-0.5]" scale="[0.12,0.12,1]" color="#8f97a6"></nve-scene-shape></nve-scene-body>
        <nve-scene-frame name="tip" frame="elbow" position="[0,0,-1]"></nve-scene-frame>
        <nve-scene-labels frame="tip" source='[{"text":"Tip","scale":18}]'></nve-scene-labels>
        </nve-scene-model>
      </nve-scene>
      <div>
        <label>Shoulder <input data-joint="shoulder" type="range" min="-1.5" max="1.5" step="0.01" value="0" /></label>
        <label>Elbow <input data-joint="elbow" type="range" min="-1.5" max="1.5" step="0.01" value="0" /></label>
        <output aria-live="polite"></output>
      </div>
      <script type="module">
        const root = document.querySelector('#pendulum');
        root.addEventListener('input', event => {
          const name = event.target.dataset.joint;
          if (name) root.querySelector('nve-scene-model').joints.set(name, Number(event.target.value));
        });
        root.addEventListener('nve-scene-error', event => {
          if (event.detail.code === 'joint-limit') root.querySelector('output').textContent = 'joint-limit: value applied outside the configured limits';
        });
      </script>
    </div>
  `
};
