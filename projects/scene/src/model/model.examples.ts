// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/frame/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/lines/define.js';
import '@nvidia-elements/scene/model/define.js';

export default {
  title: 'Elements/Scene/Model',
  component: 'nve-scene-model'
};

/**
 * @summary An articulated six-joint arm nests compound link models in scene frames, with live joint controls and an end-effector trace. Use this pattern to prototype inspectable robot kinematics without rebuilding model geometry per frame.
 */
export const Default = {
  render: () => html`
    <nve-scene id="robot-arm-scene" aria-label="six-joint industrial robot arm model" style="height: 100%">
      <nve-scene-gridlines spacing="0.25" count="24"></nve-scene-gridlines>
      <nve-scene-camera behavior="orbit" projection="perspective" target="[-0.15,-0.08,1.35]" distance="4.6" phi="1.1" theta="-0.75" fovy="0.785398163" min-distance="2.5" max-distance="10"></nve-scene-camera>
      <nve-scene-model aria-label="industrial robot arm">
        <nve-scene-part shape="cylinder" position="[0,0,0.15]" scale="[0.58,0.58,0.3]" color="#39404e"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[0,0,0.31]" scale="[0.46,0.46,0.12]" color="#76b900"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[0,0,0.185]" scale="[0.4,0.4,0.33]" color="#4a5160"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[0,0,0.475]" orientation="[0,0,0.258819,0.965926]" scale="[0.26,0.26,0.25]" color="#8f97a6"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-0.304229,-0.175647,0.990151]" orientation="[0.092752,-0.346157,0.241628,0.901769]" scale="[0.17,0.17,1.05]" color="#8f97a6"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-0.379392,-0.219042,1.74436]" orientation="[-0.079979,0.298487,0.246152,0.91865]" scale="[0.14,0.14,0.9]" color="#8f97a6"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-0.099421,-0.057401,2.189319]" orientation="[-0.026933,0.307841,0.401934,0.86195]" scale="[0.12,0.12,0.2]" color="#8f97a6"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-0.053132,-0.060929,2.364535]" orientation="[0.145455,-0.085277,0.375658,0.911291]" scale="[0.11,0.11,0.2]" color="#8f97a6"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[0,0,0.35]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[0,0,0.6]" orientation="[-0.683013,-0.183013,0.183013,0.683013]" scale="[0.24255,0.24255,0.2646]" color="#39404e"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-0.608458,-0.351294,1.380302]" orientation="[-0.572061,-0.415627,-0.073913,0.703233]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-0.150325,-0.08679,2.108417]" orientation="[-0.079979,0.298487,0.246152,0.91865]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-0.048518,-0.028012,2.270221]" orientation="[-0.628535,-0.066534,0.501887,0.590446]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-0.057746,-0.093847,2.458849]" orientation="[0.145455,-0.085277,0.375658,0.911291]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-part>
        <nve-scene-part shape="cone" position="[-0.063744,-0.136639,2.581457]" orientation="[0.145455,-0.085277,0.375658,0.911291]" scale="[0.15,0.15,0.26]" color="#e0a53e"></nve-scene-part>
      </nve-scene-model>
    </nve-scene>
  `
};

/**
 * @summary An articulated six-joint arm nests compound link models in scene frames, with live joint controls and an end-effector trace. Use this pattern to prototype inspectable robot kinematics without rebuilding model geometry per frame.
 * @tags pattern
 */
export const RobotArmAnimated = {
  render: () => html`
  <div id="robot-arm-demo" style="position: relative; height: 100%; width: 100%;">
    <nve-scene id="robot-arm-scene" aria-label="Robot arm scene" style="height: 100%">
      <nve-scene-gridlines spacing="0.25" count="24"></nve-scene-gridlines>
      <nve-scene-lines id="robot-arm-trace" width-unit="pixel"></nve-scene-lines>
      <nve-scene-camera behavior="orbit" distance="4.6" min-distance="2.5" max-distance="10"></nve-scene-camera>
      <nve-scene-model>
        <nve-scene-part shape="cylinder" position="[0,0,0.15]" scale="[0.58,0.58,0.3]" color="#39404e"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[0,0,0.31]" scale="[0.46,0.46,0.12]" color="#76b900"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[0,0,0.185]" scale="[0.4,0.4,0.33]" color="#4a5160"></nve-scene-part>
      </nve-scene-model>
      <nve-scene-model id="robot-arm-joint-model-1"><nve-scene-part id="robot-arm-joint-1" shape="cylinder" position="[0,0,0.35]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-part></nve-scene-model>
      <nve-scene-frame id="robot-arm-j1" name="j1" position="[0,0,0.35]" orientation="[0,0,0.258819,0.965926]">
        <nve-scene-model><nve-scene-part shape="cylinder" position="[0,0,0.125]" scale="[0.26,0.26,0.25]" color="#8f97a6"></nve-scene-part></nve-scene-model>
        <nve-scene-frame id="robot-arm-j2" name="j2" position="[0,0,0.25]" orientation="[0,-0.358368,0,0.93358]">
          <nve-scene-model id="robot-arm-joint-model-2"><nve-scene-part id="robot-arm-joint-2" shape="cylinder" orientation="[-0.707107,0,0,0.707107]" scale="[0.24255,0.24255,0.2646]" color="#39404e"></nve-scene-part></nve-scene-model>
          <nve-scene-model><nve-scene-part shape="cylinder" position="[0,0,0.525]" scale="[0.17,0.17,1.05]" color="#8f97a6"></nve-scene-part></nve-scene-model>
          <nve-scene-frame id="robot-arm-j3" name="j3" position="[0,0,1.05]" orientation="[0,0.62932,0,0.777146]">
            <nve-scene-model id="robot-arm-joint-model-3"><nve-scene-part id="robot-arm-joint-3" shape="cylinder" orientation="[-0.707107,0,0,0.707107]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-part></nve-scene-model>
            <nve-scene-model><nve-scene-part shape="cylinder" position="[0,0,0.45]" scale="[0.14,0.14,0.9]" color="#8f97a6"></nve-scene-part></nve-scene-model>
            <nve-scene-frame id="robot-arm-j4" name="j4" position="[0,0,0.9]" orientation="[0,0,0.173648,0.984808]">
              <nve-scene-model id="robot-arm-joint-model-4"><nve-scene-part id="robot-arm-joint-4" shape="cylinder" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-part></nve-scene-model>
              <nve-scene-model><nve-scene-part shape="cylinder" position="[0,0,0.1]" scale="[0.12,0.12,0.2]" color="#8f97a6"></nve-scene-part></nve-scene-model>
              <nve-scene-frame id="robot-arm-j5" name="j5" position="[0,0,0.2]" orientation="[0,-0.422618,0,0.906308]">
                <nve-scene-model id="robot-arm-joint-model-5"><nve-scene-part id="robot-arm-joint-5" shape="cylinder" orientation="[-0.707107,0,0,0.707107]" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-part></nve-scene-model>
                <nve-scene-model><nve-scene-part shape="cylinder" position="[0,0,0.1]" scale="[0.11,0.11,0.2]" color="#8f97a6"></nve-scene-part></nve-scene-model>
                <nve-scene-frame id="robot-arm-j6" name="j6" position="[0,0,0.2]" orientation="[0,0,0,1]">
                  <nve-scene-model id="robot-arm-joint-model-6"><nve-scene-part id="robot-arm-joint-6" shape="cylinder" scale="[0.22,0.22,0.24]" color="#39404e"></nve-scene-part></nve-scene-model>
                  <nve-scene-model><nve-scene-part shape="cone" position="[0,0,0.13]" scale="[0.15,0.15,0.26]" color="#e0a53e"></nve-scene-part></nve-scene-model>
                  <nve-scene-frame id="robot-arm-tcp" name="tcp" position="[0,0,0.26]"></nve-scene-frame>
                </nve-scene-frame>
              </nve-scene-frame>
            </nve-scene-frame>
          </nve-scene-frame>
        </nve-scene-frame>
      </nve-scene-frame>
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
    import { LINE_VERTEX, writeLineVertex } from '@nvidia-elements/scene';
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
      { name: 'J1 base', min: -180, max: 180, offset: 0.35, axis: [0, 0, 1], home: 30, amplitude: 55, rate: 0.21, phase: 0 },
      { name: 'J2 shoulder', min: -120, max: 120, offset: 0.25, axis: [0, 1, 0], home: -42, amplitude: 26, rate: 0.33, phase: 1.2 },
      { name: 'J3 elbow', min: -150, max: 150, offset: 1.05, axis: [0, 1, 0], home: 78, amplitude: 32, rate: 0.27, phase: 2.4 },
      { name: 'J4 wrist roll', min: -180, max: 180, offset: 0.9, axis: [0, 0, 1], home: 20, amplitude: 70, rate: 0.4, phase: 0.7 },
      { name: 'J5 wrist pitch', min: -120, max: 120, offset: 0.2, axis: [0, 1, 0], home: -50, amplitude: 34, rate: 0.5, phase: 3.6 },
      { name: 'J6 tool roll', min: -180, max: 180, offset: 0.2, axis: [0, 0, 1], home: 0, amplitude: 80, rate: 0.6, phase: 1.9 }
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
    const frames = joints.map((joint, index) => demo.querySelector('#robot-arm-j' + (index + 1)));
    const jointModels = joints.map((joint, index) => demo.querySelector('#robot-arm-joint-model-' + (index + 1)));
    const jointParts = joints.map((joint, index) => demo.querySelector('#robot-arm-joint-' + (index + 1)));
    const angles = joints.map(joint => joint.home + joint.amplitude * Math.sin(joint.phase));
    const traceVertices = new Uint8Array(700 * LINE_VERTEX.stride);
    const traceColorOffset = LINE_VERTEX.fields.color.offset;
    let traceLength = 0;
    let previousTip;
    let animating = true;
    let rotateCamera = animating;
    let elapsed = 0;
    let previousTime;

    trace.vertices = traceVertices;
    trace.count = 0;
    const camera = scene.querySelector('nve-scene-camera');
    camera.target = [0, 0, 1];
    camera.heading = 0;
    camera.distance = 4.6;
    camera.phi = 1.15;
    camera.theta = -0.75;
    camera.projection = 'perspective';
    camera.fovy = Math.PI / 4;

    function axisAngle(axis, degrees) {
      const halfAngle = degrees * Math.PI / 360;
      const scale = Math.sin(halfAngle);
      return [axis[0] * scale, axis[1] * scale, axis[2] * scale, Math.cos(halfAngle)];
    }

    function setAnimating(value) {
      animating = value;
      animateButton.pressed = value;
    }

    function setJointHighlighted(index, highlighted) {
      jointParts[index].color = highlighted ? '#76b900' : '#39404e';
    }

    function clearTrace() {
      traceLength = 0;
      previousTip = undefined;
      trace.count = 0;
    }

    function appendTrace(position) {
      if (previousTip && Math.hypot(position[0] - previousTip[0], position[1] - previousTip[1], position[2] - previousTip[2]) < 0.004) return;
      if (traceLength === 700) {
        traceVertices.copyWithin(0, LINE_VERTEX.stride);
        traceLength -= 1;
      }
      writeLineVertex(traceVertices, traceLength, { position, color: [0.49, 0.83, 0.99, 1], width: 4 });
      traceLength += 1;
      for (let index = 0; index < traceLength; index += 1) {
        const alpha = 0.9 * ((index + 1) / traceLength);
        traceVertices[index * LINE_VERTEX.stride + traceColorOffset + 3] = Math.round(alpha * 255);
      }
      trace.commit(0, traceLength);
      trace.count = traceLength;
      previousTip = position;
    }

    function renderPose() {
      joints.forEach((joint, index) => {
        frames[index].setTransform({ position: [0, 0, joint.offset], orientation: axisAngle(joint.axis, angles[index]) });
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
    jointModels.forEach((model, index) => {
      model.addEventListener('nve-scene-pickenter', () => setJointHighlighted(index, true));
      model.addEventListener('nve-scene-pickleave', () => setJointHighlighted(index, false));
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
        camera.theta += (delta / (1000 / 60)) * 0.00035;
      }
      requestAnimationFrame(tick);
    });
  </script>
  `
};
