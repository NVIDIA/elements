// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/model/define.js';
import '@nvidia-elements/scene/joint/define.js';
import '@nvidia-elements/scene/body/define.js';
import '@nvidia-elements/scene/camera/define.js';

export default { title: 'Elements/Scene/Model', component: 'nve-scene-model' };


/**
 * @summary An articulated model connects rigid bodies through six flat joints, with live joint controls and an end-effector trace. Use this pattern to prototype inspectable robot kinematics without rebuilding body geometry per frame.
 */
export const Default = {
  render: () => html`
    <nve-scene id="robot-arm-scene" aria-label="six-joint industrial robot arm body" style="height: 100%">
      <nve-scene-gridlines spacing="0.25" count="24"></nve-scene-gridlines>
      <nve-scene-camera behavior="orbit" projection="perspective" target="[-0.15,-0.08,1.35]" distance="4.6" polar-angle="1.1" azimuth="-0.75" vertical-field-of-view="0.785398163" min-distance="2.5" max-distance="10"></nve-scene-camera>
      <nve-scene-model name="arm">
        <nve-scene-joint id="robot-arm-j1" name="j1" type="revolute" axis="[0,0,1]" position="[0,0,0.35]" value="0.5235987755982988" parent="base" child="body1"></nve-scene-joint>
        <nve-scene-joint id="robot-arm-j2" name="j2" type="revolute" axis="[0,1,0]" position="[0,0,0.25]" value="-0.7330382858376184" parent="body1" child="body2"></nve-scene-joint>
        <nve-scene-joint id="robot-arm-j3" name="j3" type="revolute" axis="[0,1,0]" position="[0,0,1.05]" value="1.361356816555577" parent="body2" child="body3"></nve-scene-joint>
        <nve-scene-joint id="robot-arm-j4" name="j4" type="revolute" axis="[0,0,1]" position="[0,0,0.9]" value="0.3490658503988659" parent="body3" child="body4"></nve-scene-joint>
        <nve-scene-joint id="robot-arm-j5" name="j5" type="revolute" axis="[0,1,0]" position="[0,0,0.2]" value="-0.8726646259971648" parent="body4" child="body5"></nve-scene-joint>
        <nve-scene-joint id="robot-arm-j6" name="j6" type="revolute" axis="[0,0,1]" position="[0,0,0.2]" value="0" parent="body5" child="body6"></nve-scene-joint>
        <nve-scene-frame id="robot-arm-tcp" name="tcp" frame="body6" position="[0,0,0.26]"></nve-scene-frame>
        <nve-scene-body name="base" id="robot-arm-joint-body-1" interactive>
          <nve-scene-shape type="cylinder" position="[0,0,0.15]" scale="[0.58,0.58,0.3]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.31]" scale="[0.46,0.46,0.12]" color="#76b900"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.185]" scale="[0.4,0.4,0.33]" color="#4a5160"></nve-scene-shape>
          <nve-scene-shape id="robot-arm-joint-1" type="cylinder" position="[0,0,0.35]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body1">
          <nve-scene-shape type="cylinder" position="[0,0,0.125]" scale="[0.26,0.26,0.25]" color="#8f97a6"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body2" id="robot-arm-joint-body-2" interactive>
          <nve-scene-shape id="robot-arm-joint-2" type="cylinder" orientation="[-0.707107,0,0,0.707107]" scale="[0.24255,0.24255,0.2646]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.525]" scale="[0.17,0.17,1.05]" color="#8f97a6"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body3" id="robot-arm-joint-body-3" interactive>
          <nve-scene-shape id="robot-arm-joint-3" type="cylinder" orientation="[-0.707107,0,0,0.707107]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.45]" scale="[0.14,0.14,0.9]" color="#8f97a6"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body4" id="robot-arm-joint-body-4" interactive>
          <nve-scene-shape id="robot-arm-joint-4" type="cylinder" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.1]" scale="[0.12,0.12,0.2]" color="#8f97a6"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body5" id="robot-arm-joint-body-5" interactive>
          <nve-scene-shape id="robot-arm-joint-5" type="cylinder" orientation="[-0.707107,0,0,0.707107]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.1]" scale="[0.11,0.11,0.2]" color="#8f97a6"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body6" id="robot-arm-joint-body-6" interactive>
          <nve-scene-shape id="robot-arm-joint-6" type="cylinder" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cone" position="[0,0,0.13]" scale="[0.15,0.15,0.26]" color="#e0a53e"></nve-scene-shape>
        </nve-scene-body>
      </nve-scene-model>
    </nve-scene>
  `
};

/**
 * @summary An articulated model connects rigid bodies through six flat joints, with live joint controls and an end-effector trace. Use this pattern to prototype inspectable robot kinematics without rebuilding body geometry per frame.
 * @tags pattern
 */
export const RobotArmAnimated = {
  render: () => html`
  <div id="robot-arm-demo" style="position: relative; height: 100%; width: 100%;">
    <nve-scene id="robot-arm-scene" aria-label="Robot arm scene" style="height: 100%">
      <nve-scene-gridlines spacing="0.25" count="24"></nve-scene-gridlines>
      <nve-scene-lines id="robot-arm-trace" width-unit="pixel"></nve-scene-lines>
      <nve-scene-camera behavior="orbit" distance="4.6" min-distance="2.5" max-distance="10"></nve-scene-camera>
      <nve-scene-model name="arm">
        <nve-scene-joint id="robot-arm-j1" name="j1" type="revolute" axis="[0,0,1]" position="[0,0,0.35]" value="0.5235987755982988" parent="base" child="body1"></nve-scene-joint>
        <nve-scene-joint id="robot-arm-j2" name="j2" type="revolute" axis="[0,1,0]" position="[0,0,0.25]" value="-0.7330382858376184" parent="body1" child="body2"></nve-scene-joint>
        <nve-scene-joint id="robot-arm-j3" name="j3" type="revolute" axis="[0,1,0]" position="[0,0,1.05]" value="1.361356816555577" parent="body2" child="body3"></nve-scene-joint>
        <nve-scene-joint id="robot-arm-j4" name="j4" type="revolute" axis="[0,0,1]" position="[0,0,0.9]" value="0.3490658503988659" parent="body3" child="body4"></nve-scene-joint>
        <nve-scene-joint id="robot-arm-j5" name="j5" type="revolute" axis="[0,1,0]" position="[0,0,0.2]" value="-0.8726646259971648" parent="body4" child="body5"></nve-scene-joint>
        <nve-scene-joint id="robot-arm-j6" name="j6" type="revolute" axis="[0,0,1]" position="[0,0,0.2]" value="0" parent="body5" child="body6"></nve-scene-joint>
        <nve-scene-frame id="robot-arm-tcp" name="tcp" frame="body6" position="[0,0,0.26]"></nve-scene-frame>
        <nve-scene-body name="base" id="robot-arm-joint-body-1" interactive>
          <nve-scene-shape type="cylinder" position="[0,0,0.15]" scale="[0.58,0.58,0.3]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.31]" scale="[0.46,0.46,0.12]" color="#76b900"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.185]" scale="[0.4,0.4,0.33]" color="#4a5160"></nve-scene-shape>
          <nve-scene-shape id="robot-arm-joint-1" type="cylinder" position="[0,0,0.35]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body1">
          <nve-scene-shape type="cylinder" position="[0,0,0.125]" scale="[0.26,0.26,0.25]" color="#8f97a6"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body2" id="robot-arm-joint-body-2" interactive>
          <nve-scene-shape id="robot-arm-joint-2" type="cylinder" orientation="[-0.707107,0,0,0.707107]" scale="[0.24255,0.24255,0.2646]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.525]" scale="[0.17,0.17,1.05]" color="#8f97a6"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body3" id="robot-arm-joint-body-3" interactive>
          <nve-scene-shape id="robot-arm-joint-3" type="cylinder" orientation="[-0.707107,0,0,0.707107]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.45]" scale="[0.14,0.14,0.9]" color="#8f97a6"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body4" id="robot-arm-joint-body-4" interactive>
          <nve-scene-shape id="robot-arm-joint-4" type="cylinder" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.1]" scale="[0.12,0.12,0.2]" color="#8f97a6"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body5" id="robot-arm-joint-body-5" interactive>
          <nve-scene-shape id="robot-arm-joint-5" type="cylinder" orientation="[-0.707107,0,0,0.707107]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cylinder" position="[0,0,0.1]" scale="[0.11,0.11,0.2]" color="#8f97a6"></nve-scene-shape>
        </nve-scene-body>
        <nve-scene-body name="body6" id="robot-arm-joint-body-6" interactive>
          <nve-scene-shape id="robot-arm-joint-6" type="cylinder" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-shape>
          <nve-scene-shape type="cone" position="[0,0,0.13]" scale="[0.15,0.15,0.26]" color="#e0a53e"></nve-scene-shape>
        </nve-scene-body>
      </nve-scene-model>
    </nve-scene>
    <nve-card style="position: absolute; inset-block-start: 16px; inset-inline-start: 16px; width: min(320px, calc(100% - 32px))">
      <nve-card-header><h2 nve-text="heading sm medium">Robot arm FK</h2></nve-card-header>
      <nve-card-content>
        <div id="robot-arm-joints" nve-layout="column gap:xs"></div>
      </nve-card-content>
      <nve-card-footer>
        <div nve-layout="column gap:xs full">
          <div nve-layout="row gap:xs"><nve-button id="robot-arm-animate" type="button">animate</nve-button><nve-button id="robot-arm-clear" type="button" container="flat">clear trace</nve-button></div>
          <p nve-text="body sm muted">Drag · orbit · scroll to zoom.</p>
        </div>
      </nve-card-footer>
    </nve-card>
  </div>
  <script type="module">
    import { LINE_VERTEX } from '@nvidia-elements/scene';
    import { LineVertexBuffer } from '@nvidia-elements/scene/lines';
    import '@nvidia-elements/core/range/define.js';

    await customElements.whenDefined('nve-scene');
    const demo = document.querySelector('#robot-arm-demo');
    const scene = demo.querySelector('#robot-arm-scene');
    await scene.ready;
    const trace = demo.querySelector('#robot-arm-trace');
    const tcp = demo.querySelector('#robot-arm-tcp');
    const animateButton = demo.querySelector('#robot-arm-animate');
    const clearButton = demo.querySelector('#robot-arm-clear');
    const joints = [
      { name: 'J1 base', min: -180, max: 180, home: 30, amplitude: 55, rate: 0.21, phase: 0 },
      { name: 'J2 shoulder', min: -120, max: 120, home: -42, amplitude: 26, rate: 0.33, phase: 1.2 },
      { name: 'J3 elbow', min: -150, max: 150, home: 78, amplitude: 32, rate: 0.27, phase: 2.4 },
      { name: 'J4 wrist roll', min: -180, max: 180, home: 20, amplitude: 70, rate: 0.4, phase: 0.7 },
      { name: 'J5 wrist pitch', min: -120, max: 120, home: -50, amplitude: 34, rate: 0.5, phase: 3.6 },
      { name: 'J6 tool roll', min: -180, max: 180, home: 0, amplitude: 80, rate: 0.6, phase: 1.9 }
    ];
    const controls = demo.querySelector('#robot-arm-joints');
    const ranges = [];
    const outputs = [];
    joints.forEach((joint, index) => {
      const id = 'robot-arm-range-' + (index + 1);
      const control = document.createElement('nve-range');
      control.setAttribute('layout', 'horizontal-inline');
      control.innerHTML = '<label for="' + id + '">' + joint.name + ' · <output for="' + id + '"></output></label><input id="' + id + '" type="range" min="' + joint.min + '" max="' + joint.max + '" step="0.5" value="' + joint.home + '">';
      controls.append(control);
      ranges.push(control.querySelector('input'));
      outputs.push(control.querySelector('output'));
    });
    const arm = demo.querySelector('nve-scene-model');
    const jointBodies = joints.map((joint, index) => demo.querySelector('#robot-arm-joint-body-' + (index + 1)));
    const jointShapes = joints.map((joint, index) => demo.querySelector('#robot-arm-joint-' + (index + 1)));
    const angles = joints.map(joint => joint.home + joint.amplitude * Math.sin(joint.phase));
    const traceVertices = new LineVertexBuffer({ capacity: 700 });
    const traceColorOffset = LINE_VERTEX.fields.color.offset;
    let traceLength = 0;
    let previousTip;
    let animating = true;
    let rotateCamera = animating;
    let elapsed = 0;
    let previousTime;

    trace.source = traceVertices;
    trace.countLimit = 0;
    const camera = scene.querySelector('nve-scene-camera');
    camera.target = [0, 0, 1];
    camera.heading = 0;
    camera.distance = 4.6;
    camera.polarAngle = 1.15;
    camera.azimuth = -0.75;
    camera.projection = 'perspective';
    camera.verticalFieldOfView = Math.PI / 4;

    function setAnimating(value) {
      animating = value;
      animateButton.pressed = value;
    }

    function setJointHighlighted(index, highlighted) {
      jointShapes[index].color = highlighted ? '#76b900' : '#39404e';
    }

    function clearTrace() {
      traceLength = 0;
      previousTip = undefined;
      trace.countLimit = 0;
    }

    function appendTrace(position) {
      if (previousTip && Math.hypot(position[0] - previousTip[0], position[1] - previousTip[1], position[2] - previousTip[2]) < 0.004) return;
      if (traceLength === 700) {
        traceVertices.mutableBytes.copyWithin(0, LINE_VERTEX.stride);
        traceLength -= 1;
      }
      traceVertices.set(traceLength, { position, color: [0.49, 0.83, 0.99, 1], width: 4 });
      traceLength += 1;
      for (let index = 0; index < traceLength; index += 1) {
        const alpha = 0.9 * ((index + 1) / traceLength);
        traceVertices.mutableBytes[index * LINE_VERTEX.stride + traceColorOffset + 3] = Math.round(alpha * 255);
      }
      trace.publish({ start: 0, count: traceLength });
      trace.countLimit = traceLength;
      previousTip = position;
    }

    function renderPose() {
      arm.joints.set(Object.fromEntries(joints.map((joint, index) => ['j' + (index + 1), angles[index] * Math.PI / 180])));
      joints.forEach((joint, index) => {
        ranges[index].value = String(angles[index]);
        outputs[index].value = angles[index].toFixed(1) + '°';
      });
      const worldMatrix = tcp.getWorldMatrix();
      appendTrace([worldMatrix[12], worldMatrix[13], worldMatrix[14]]);
    }

    ranges.forEach((range, index) => {
      range.addEventListener('input', () => {
        setAnimating(false);
        angles[index] = range.valueAsNumber;
        renderPose();
      });
    });
    jointBodies.forEach((body, index) => {
      body.addEventListener('nve-scene-pointerenter', () => setJointHighlighted(index, true));
      body.addEventListener('nve-scene-pointerleave', () => setJointHighlighted(index, false));
    });
    animateButton.addEventListener('click', () => setAnimating(!animating));
    clearButton.addEventListener('click', clearTrace);
    scene.addEventListener('pointerdown', () => (rotateCamera = false), { once: true });
    scene.addEventListener('wheel', () => (rotateCamera = false), { once: true, passive: true });

    setAnimating(animating);
    renderPose();
    requestAnimationFrame(function tick(time) {
      if (!demo.isConnected) return;
      previousTime ??= time;
      const delta = Math.min(time - previousTime, 100);
      previousTime = time;
      elapsed += delta / 1000;
      if (animating) {
        joints.forEach((joint, index) => {
          angles[index] = joint.home + joint.amplitude * Math.sin(elapsed * joint.rate * Math.PI + joint.phase);
        });
        renderPose();
      }
      if (rotateCamera) {
        camera.azimuth += (delta / (1000 / 60)) * 0.00035;
      }
      requestAnimationFrame(tick);
    });
  </script>
  `
};
