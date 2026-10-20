// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/model/define.js';
import '@nvidia-elements/scene/joint/define.js';
import '@nvidia-elements/scene/body/define.js';
import '@nvidia-elements/scene/camera/define.js';

export default { title: 'Elements/Scene/Model', component: 'nve-scene-model' };

/**
 * @summary Group two joint-connected bodies into one named entity. Use a model to move and tint the whole assembly while keeping joint names local to that entity.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Model with two joint-connected bodies" style="height: 100%">
      <nve-scene-camera behavior="orbit" target="[0.3,0,0.8]" distance="4" polar-angle="1.1" azimuth="-0.8"></nve-scene-camera>
      <nve-scene-model name="arm" position="[0,0,0.2]" tint="#76b900">
        <nve-scene-joint name="shoulder" axis="[0,1,0]" value="0.4"></nve-scene-joint>
        <nve-scene-joint name="elbow" frame="shoulder" axis="[0,1,0]" position="[0,0,1]" value="-0.8"></nve-scene-joint>
        <nve-scene-body frame="shoulder">
          <nve-scene-shape kind="cylinder" position="[0,0,0.5]" scale="[0.15,0.15,1]"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body frame="elbow">
          <nve-scene-shape kind="cylinder" position="[0,0,0.4]" scale="[0.12,0.12,0.8]"></nve-scene-shape>
        </nve-scene-body>
      </nve-scene-model>
    </nve-scene>
  `
};

/**
 * @summary Drive two copies of one arm template independently. Each model owns the same internal joint names, while the camera follows armB/tcp through its qualified name.
 */
export const IndependentArms = {
  render: () => html`
    <div id="independent-arms" style="height:100%;display:grid;grid-template-rows:1fr auto">
      <nve-scene aria-label="Two independent arms">
        <nve-scene-camera behavior="orbit" distance="6" polar-angle="1.1" azimuth="-0.8"></nve-scene-camera>
        <nve-scene-camera behavior="follow" frame="armB/tcp"></nve-scene-camera>
        ${['armA', 'armB'].map(
          (name, index) => html`
          <nve-scene-model name=${name} position=${JSON.stringify([index * 2 - 1, 0, 0])} tint=${index ? '#76b900' : '#8f97a6'}>
            <nve-scene-joint name="shoulder" axis="[0,1,0]" position="[0,0,0.2]"></nve-scene-joint>
            <nve-scene-joint name="elbow" frame="shoulder" axis="[0,1,0]" position="[0,0,1]"></nve-scene-joint>
            <nve-scene-frame name="tcp" frame="elbow" position="[0,0,0.8]"></nve-scene-frame>
            <nve-scene-body frame="shoulder"><nve-scene-shape position="[0,0,0.5]" scale="[0.15,0.15,1]"></nve-scene-shape></nve-scene-body>
            <nve-scene-body frame="elbow"><nve-scene-shape position="[0,0,0.4]" scale="[0.12,0.12,0.8]"></nve-scene-shape></nve-scene-body>
          </nve-scene-model>
        `
        )}
      </nve-scene>
      <div>
        <label>Arm A <input data-model="armA" type="range" min="-1.5" max="1.5" step="0.01" value="0" /></label>
        <label>Arm B <input data-model="armB" type="range" min="-1.5" max="1.5" step="0.01" value="0" /></label>
      </div>
      <script type="module">
        const root = document.querySelector('#independent-arms');
        root.addEventListener('input', event => {
          const model = root.querySelector('nve-scene-model[name="' + event.target.dataset.model + '"]');
          if (model) {
            model.joints.set('shoulder', Number(event.target.value));
            model.joints.set('elbow', -Number(event.target.value) / 2);
          }
        });
      </script>
    </div>
  `
};
