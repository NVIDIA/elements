// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/axes/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/frame/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/lines/define.js';
import '@nvidia-elements/scene/model/define.js';
import '@nvidia-elements/scene/scene/define.js';

export default {
  title: 'Elements/Scene/Camera',
  component: 'nve-scene-camera'
};

/**
 * @summary A basic orbit camera frames a rover model. Use this starting point for an interactive inspection view with pointer, keyboard, and wheel navigation.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="orbit camera viewing a rover" style="min-height: 480px">
      <nve-scene-camera behavior="orbit" target="[0,0,1]" distance="8" phi="0.9" theta="-0.75"></nve-scene-camera>
      <nve-scene-model aria-label="rover model">
        <nve-scene-part shape="cube" position="[0,0,0.68]" scale="[1.9,1.3,0.5]" color="#76b900"></nve-scene-part>
        <nve-scene-part shape="cube" position="[0.35,0,1.04]" scale="[0.7,1,0.22]" color="#76b900"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-0.55,0,1.38]" scale="[0.1,0.1,0.9]" color="#343946"></nve-scene-part>
        <nve-scene-part shape="cube" position="[-0.55,0,1.91]" scale="[0.22,0.34,0.16]" color="#e0a53e"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[0.7,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[0.7,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[0,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[0,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-0.7,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-0.7,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
      </nve-scene-model>
    </nve-scene>
  `
};

/**
 * @summary A follow camera tracks the pose of a rover driving around a circular course. Use this composition to keep a moving subject centered while retaining orbit distance and viewing-angle controls.
 */
export const BehaviorFollow = {
  render: () => html`
    <nve-scene id="camera-follow-scene" aria-label="follow camera tracking a rover on a circular course" style="min-height: 480px">
      <nve-scene-camera behavior="follow" frame="camera-follow-rover" mode="pose"></nve-scene-camera>
      <nve-scene-camera behavior="orbit" projection="perspective" target="[0,0,1]" distance="11" phi="1.18" theta="3.141592654" fovy="0.785398163"></nve-scene-camera>
      <nve-scene-gridlines count="12" spacing="2"></nve-scene-gridlines>
      <nve-scene-lines id="camera-follow-track" topology="loop" width-unit="pixel"></nve-scene-lines>
      <nve-scene-frame id="camera-follow-rover" name="camera-follow-rover">
        <nve-scene-model aria-label="rover model">
          <nve-scene-part shape="cube" position="[0,0,0.68]" scale="[1.9,1.3,0.5]" color="#76b900"></nve-scene-part>
          <nve-scene-part shape="cube" position="[0.35,0,1.04]" scale="[0.7,1,0.22]" color="#76b900"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[-0.55,0,1.38]" scale="[0.1,0.1,0.9]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cube" position="[-0.55,0,1.91]" scale="[0.22,0.34,0.16]" color="#e0a53e"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[0.7,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[0.7,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[0,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[0,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[-0.7,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[-0.7,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
        </nve-scene-model>
      </nve-scene-frame>
    </nve-scene>
    <script type="module">
      import { LINE_VERTEX, writeLineVertex } from '@nvidia-elements/scene';

      await Promise.all([
        customElements.whenDefined('nve-scene'),
        customElements.whenDefined('nve-scene-frame'),
        customElements.whenDefined('nve-scene-lines')
      ]);

      const scene = document.querySelector('#camera-follow-scene');
      const track = scene.querySelector('#camera-follow-track');
      const rover = scene.querySelector('#camera-follow-rover');
      const radius = 12;
      const segments = 96;
      const vertices = new Uint8Array(new ArrayBuffer(segments * LINE_VERTEX.stride));
      const view = new DataView(vertices.buffer);
      for (let index = 0; index < segments; index += 1) {
        const angle = (index / segments) * Math.PI * 2;
        writeLineVertex(view, index, {
          position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0.08],
          color: [0.12, 0.82, 0.95, 1],
          width: 6
        });
      }
      track.vertices = vertices;

      const setRoverPose = angle => {
        const heading = angle + Math.PI / 2;
        rover.setTransform({
          position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
          orientation: [0, 0, Math.sin(heading / 2), Math.cos(heading / 2)]
        });
      };
      setRoverPose(-Math.PI / 2);

      let start;
      requestAnimationFrame(function drive(time) {
        if (!scene.isConnected) return;
        start ??= time;
        setRoverPose(((time - start) / 14000) * Math.PI * 2 - Math.PI / 2);
        requestAnimationFrame(drive);
      });
    </script>
  `
};

/**
 * @summary Combines a fixed orthographic camera with a rover driving around a circular course. Use this composition for map-coordinate monitoring that must preserve scale.
 */
export const BehaviorTop = {
  render: () => html`
    <nve-scene id="camera-top-scene" aria-label="top camera viewing a rover on a circular course" style="min-height: 480px">
      <nve-scene-camera behavior="top" target="[0,0,0]" height="34"></nve-scene-camera>
      <nve-scene-gridlines count="12" spacing="2"></nve-scene-gridlines>
      <nve-scene-lines id="camera-top-track" topology="loop" width-unit="pixel"></nve-scene-lines>
      <nve-scene-frame id="camera-top-rover" name="camera-top-rover">
        <nve-scene-model aria-label="rover model">
          <nve-scene-part shape="cube" position="[0,0,0.68]" scale="[1.9,1.3,0.5]" color="#76b900"></nve-scene-part>
          <nve-scene-part shape="cube" position="[0.35,0,1.04]" scale="[0.7,1,0.22]" color="#76b900"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[-0.55,0,1.38]" scale="[0.1,0.1,0.9]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cube" position="[-0.55,0,1.91]" scale="[0.22,0.34,0.16]" color="#e0a53e"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[0.7,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[0.7,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[0,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[0,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[-0.7,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[-0.7,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-part>
        </nve-scene-model>
      </nve-scene-frame>
    </nve-scene>
    <script type="module">
      import { LINE_VERTEX, writeLineVertex } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/lines/define.js';
      import '@nvidia-elements/scene/frame/define.js';
      import '@nvidia-elements/scene/model/define.js';

      await Promise.all([
        customElements.whenDefined('nve-scene'),
        customElements.whenDefined('nve-scene-frame'),
        customElements.whenDefined('nve-scene-lines')
      ]);

      const scene = document.querySelector('#camera-top-scene');
      const track = scene.querySelector('#camera-top-track');
      const rover = scene.querySelector('#camera-top-rover');
      const radius = 12;
      const segments = 96;
      const vertices = new Uint8Array(new ArrayBuffer(segments * LINE_VERTEX.stride));
      const view = new DataView(vertices.buffer);
      for (let index = 0; index < segments; index += 1) {
        const angle = (index / segments) * Math.PI * 2;
        writeLineVertex(view, index, {
          position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0.08],
          color: [0.12, 0.82, 0.95, 1],
          width: 6
        });
      }
      track.vertices = vertices;

      const setRoverPose = angle => {
        const heading = angle + Math.PI / 2;
        rover.setTransform({
          position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
          orientation: [0, 0, Math.sin(heading / 2), Math.cos(heading / 2)]
        });
      };
      setRoverPose(-Math.PI / 2);

      let start;
      requestAnimationFrame(function drive(time) {
        if (!scene.isConnected) return;
        start ??= time;
        setRoverPose(((time - start) / 14000) * Math.PI * 2 - Math.PI / 2);
        requestAnimationFrame(drive);
      });
    </script>
  `
};
