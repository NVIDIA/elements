// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/select/define.js';
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
 * @summary A static optical pose camera frames reference geometry.
 */
export const InstallSource = {
  render: () => html`
    <nve-scene aria-label="default camera viewing reference geometry" style="min-height: 480px">
      <nve-scene-camera></nve-scene-camera>
      <nve-scene-gridlines count="12" spacing="2"></nve-scene-gridlines>
      <nve-scene-axes length="4" width="5"></nve-scene-axes>
      <nve-scene-model aria-label="orbit camera reference">
        <nve-scene-part shape="cube" position="[-2,-1,0.5]" color="yellow"></nve-scene-part>
        <nve-scene-part shape="sphere" position="[0,0,0.75]" color="cyan"></nve-scene-part>
        <nve-scene-part shape="pyramid" position="[2,1,0.75]" color="magenta"></nve-scene-part>
      </nve-scene-model>
    </nve-scene>
  `
};

/**
 * @summary A page panel exposes controls for an application-owned optical camera pose and projection while the scene remains the primary content. Use this pattern for operator tools that tune a view without enabling built-in scene navigation.
 */
export const Default = {
  render: () => html`
    <nve-page id="pose-controls-demo">
      <main>
        <nve-scene id="pose-controls-scene" aria-label="interactive optical pose camera" style="width: 100%; height: 100%;">
          <nve-scene-camera behavior="pose" position="[0,-8.5,8.5]" orientation="[-0.92388,0,0,0.382683]" near="0.5" far="40" fovy="0.872665"></nve-scene-camera>
          <nve-scene-gridlines count="14" spacing="1"></nve-scene-gridlines>
          <nve-scene-axes length="4" width="2"></nve-scene-axes>
          <nve-scene-model aria-label="camera pose reference">
            <nve-scene-part shape="cube" position="[-2,-1,0.5]" color="yellow"></nve-scene-part>
            <nve-scene-part shape="sphere" position="[0,0,0.75]" color="cyan"></nve-scene-part>
            <nve-scene-part shape="pyramid" position="[2,1,0.75]" color="magenta"></nve-scene-part>
          </nve-scene-model>
        </nve-scene>
      </main>

      <nve-page-panel slot="right" aria-label="Camera pose controls">
        <nve-page-panel-content>
          <form id="pose-controls-form" nve-layout="column gap:lg">
            <div nve-layout="column gap:sm" role="group" aria-labelledby="pose-controls-position-heading">
              <h3 id="pose-controls-position-heading" nve-text="label sm muted">Position (meters)</h3>
              <nve-range layout="horizontal" fit-content style="--control-width: 100%; --label-width: 100px;">
                <label for="pose-controls-x">X <output for="pose-controls-x">0</output></label>
                <input id="pose-controls-x" name="x" type="range" min="-16" max="16" step="0.1" value="0" />
              </nve-range>
              <nve-range layout="horizontal" fit-content style="--control-width: 100%; --label-width: 100px;">
                <label for="pose-controls-y">Y <output for="pose-controls-y">-8.5</output></label>
                <input id="pose-controls-y" name="y" type="range" min="-16" max="16" step="0.1" value="-8.5" />
              </nve-range>
              <nve-range layout="horizontal" fit-content style="--control-width: 100%; --label-width: 100px;">
                <label for="pose-controls-z">Z <output for="pose-controls-z">8.5</output></label>
                <input id="pose-controls-z" name="z" type="range" min="-16" max="16" step="0.1" value="8.5" />
              </nve-range>
            </div>

            <div nve-layout="column gap:sm" role="group" aria-labelledby="pose-controls-orientation-heading">
              <h3 id="pose-controls-orientation-heading" nve-text="label sm muted">Orientation (degrees)</h3>
              <nve-range layout="horizontal" fit-content style="--control-width: 100%; --label-width: 100px;">
                <label for="pose-controls-pitch">Pitch <output for="pose-controls-pitch">-135</output></label>
                <input id="pose-controls-pitch" name="pitch" type="range" min="-180" max="180" step="1" value="-135" />
              </nve-range>
              <nve-range layout="horizontal" fit-content style="--control-width: 100%; --label-width: 100px;">
                <label for="pose-controls-yaw">Yaw <output for="pose-controls-yaw">0</output></label>
                <input id="pose-controls-yaw" name="yaw" type="range" min="-45" max="45" step="1" value="0" />
              </nve-range>
              <nve-range layout="horizontal" fit-content style="--control-width: 100%; --label-width: 100px;">
                <label for="pose-controls-roll">Roll <output for="pose-controls-roll">0</output></label>
                <input id="pose-controls-roll" name="roll" type="range" min="-180" max="180" step="1" value="0" />
              </nve-range>
            </div>

            <div nve-layout="column gap:sm" role="group" aria-labelledby="pose-controls-projection-heading">
              <h3 id="pose-controls-projection-heading" nve-text="label sm muted">Projection</h3>
              <div nve-layout="grid gap:sm span-items:6">
                <nve-select>
                  <label for="pose-controls-projection">Mode</label>
                  <select id="pose-controls-projection" name="projection">
                    <option value="perspective" selected>Perspective</option>
                    <option value="ortho">Orthographic</option>
                  </select>
                </nve-select>
                <div id="pose-controls-perspective">
                  <nve-range>
                    <label for="pose-controls-fovy">Field of view <output for="pose-controls-fovy">50</output>°</label>
                    <input id="pose-controls-fovy" name="fovy" type="range" min="30" max="100" step="1" value="50" />
                  </nve-range>
                </div>
                <div id="pose-controls-ortho" hidden>
                  <nve-range>
                    <label for="pose-controls-height">View height <output for="pose-controls-height">14</output> m</label>
                    <input id="pose-controls-height" name="height" type="range" min="4" max="30" step="0.5" value="14" />
                  </nve-range>
                </div>
              </div>
              <div nve-layout="grid gap:sm span-items:6">
                <nve-range>
                  <label for="pose-controls-near">Near <output for="pose-controls-near">0.5</output> m</label>
                  <input id="pose-controls-near" name="near" type="range" min="0.1" max="5" step="0.1" value="0.5" />
                </nve-range>
                <nve-range>
                  <label for="pose-controls-far">Far <output for="pose-controls-far">40</output> m</label>
                  <input id="pose-controls-far" name="far" type="range" min="10" max="100" step="1" value="40" />
                </nve-range>
              </div>
            </div>

            <nve-button id="pose-controls-reset" type="button" container="flat">Reset camera</nve-button>
          </form>
        </nve-page-panel-content>
      </nve-page-panel>
    </nve-page>

    <script type="module">
      const demo = document.querySelector('#pose-controls-demo');
      const camera = demo.querySelector('nve-scene-camera');
      const form = demo.querySelector('#pose-controls-form');
      const projection = form.elements.namedItem('projection');
      const perspective = demo.querySelector('#pose-controls-perspective');
      const ortho = demo.querySelector('#pose-controls-ortho');
      const number = name => Number(form.elements.namedItem(name).value);
      const radians = degrees => (degrees * Math.PI) / 180;

      const update = () => {
        const pitch = radians(number('pitch')) / 2;
        const yaw = radians(number('yaw')) / 2;
        const roll = radians(number('roll')) / 2;
        const [sx, cx] = [Math.sin(pitch), Math.cos(pitch)];
        const [sy, cy] = [Math.sin(yaw), Math.cos(yaw)];
        const [sz, cz] = [Math.sin(roll), Math.cos(roll)];

        camera.position = [number('x'), number('y'), number('z')];
        camera.orientation = [
          cz * cy * sx - sz * sy * cx,
          cz * sy * cx + sz * cy * sx,
          sz * cy * cx - cz * sy * sx,
          cz * cy * cx + sz * sy * sx
        ];
        camera.projection = projection.value;
        camera.fovy = radians(number('fovy'));
        camera.frustumHeight = number('height');
        camera.near = number('near');
        camera.far = number('far');

        perspective.hidden = projection.value !== 'perspective';
        ortho.hidden = projection.value !== 'ortho';
        for (const input of form.querySelectorAll('input[type="range"]')) {
          const output = form.querySelector('output[for="' + input.id + '"]');
          if (output) output.value = input.value;
        }
      };

      form.addEventListener('input', update);
      form.addEventListener('change', update);
      demo.querySelector('#pose-controls-reset').addEventListener('click', () => {
        form.reset();
        update();
      });
      update();
    </script>
  `
};


/**
 * @summary An orbit camera adds pointer, keyboard, and wheel navigation around a target. Use this behavior for inspection views that let users explore scene geometry.
 */
export const BehaviorOrbit = {
  render: () => html`
      <div style="position: relative;">
        <nve-scene aria-label="default camera viewing a rover" style="min-height: 480px">
          <nve-scene-gridlines count="12" spacing="2"></nve-scene-gridlines>
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
        <nve-card aria-label="camera keyboard controls" style="position: absolute; inset: 6px auto auto 6px; width: fit-content; z-index: 1;">
          <nve-card-content>
            <ul nve-text="list" nve-layout="column gap:xs">
              <li nve-text="body sm"><kbd>Arrow keys</kbd> orbit the camera.</li>
              <li nve-text="body sm"><kbd>Shift</kbd> + <kbd>Arrow keys</kbd> pan across the ground plane.</li>
              <li nve-text="body sm"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Up</kbd> / <kbd>Down</kbd> move vertically.</li>
              <li nve-text="body sm"><kbd>+</kbd> or <kbd>=</kbd> zoom in; <kbd>-</kbd> zooms out.</li>
            </ul>
          </nve-card-content>
        </nve-card>
      </div>
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
      import { LineVertexBuffer } from '@nvidia-elements/scene';

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
      const vertices = new LineVertexBuffer({ capacity: segments });
      for (let index = 0; index < segments; index += 1) {
        const angle = (index / segments) * Math.PI * 2;
        vertices.set(index, {
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
      import { LineVertexBuffer } from '@nvidia-elements/scene';
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
      const vertices = new LineVertexBuffer({ capacity: segments });
      for (let index = 0; index < segments; index += 1) {
        const angle = (index / segments) * Math.PI * 2;
        vertices.set(index, {
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
