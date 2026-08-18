// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/media/pause-button/define.js';
import '@nvidia-elements/media/seek-button/define.js';
import '@nvidia-elements/media/time-range/define.js';
import '@nvidia-elements/scene/arrows/define.js';
import '@nvidia-elements/scene/axes/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/cones/define.js';
import '@nvidia-elements/scene/cubes/define.js';
import '@nvidia-elements/scene/cylinders/define.js';
import '@nvidia-elements/scene/frame/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/heightfield/define.js';
import '@nvidia-elements/scene/label/define.js';
import '@nvidia-elements/scene/lines/define.js';
import '@nvidia-elements/scene/mesh/define.js';
import '@nvidia-elements/scene/model/define.js';
import '@nvidia-elements/scene/points/define.js';
import '@nvidia-elements/scene/pyramids/define.js';
import '@nvidia-elements/scene/scene/define.js';
import '@nvidia-elements/scene/spheres/define.js';
import '@nvidia-elements/scene/triangles/define.js';

export default {
  title: 'Elements/Scene',
  component: 'nve-scene'
};

/**
 * @summary Combines reference geometry, opaque and outlined translucent primitives, streamed data, terrain, a mesh, a compound model, and a DOM label. Use this scene as a compact starting point for exploring each major Scene component.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Basic scene component showcase">
      <p slot="fallback" nve-text="body">3D scene unavailable.</p>

      <nve-scene-gridlines count="14"></nve-scene-gridlines>
      <nve-scene-axes length="3"></nve-scene-axes>
      <nve-scene-camera behavior="orbit" target="[0,0,1]" distance="18"></nve-scene-camera>

      <nve-scene-cubes>
        <nve-scene-marker position="[-6,2.5,0.5]" color="cyan"></nve-scene-marker>
        <nve-scene-marker position="[-4,0,0.5]" color="rgba(0,255,255,0.2)" outline-color="cyan"></nve-scene-marker>
        <nve-scene-marker position="[-3.6,0.2,0.5]" color="rgba(255,255,0,0.2)" outline-color="yellow"></nve-scene-marker>
        <nve-scene-marker position="[-4.4,-0.2,0.5]" color="rgba(255,0,255,0.2)" outline-color="magenta"></nve-scene-marker>
      </nve-scene-cubes>
      <nve-scene-spheres>
        <nve-scene-marker position="[-4,2.5,0.5]" color="magenta"></nve-scene-marker>
      </nve-scene-spheres>
      <nve-scene-cylinders>
        <nve-scene-marker position="[-2,2.5,0.75]" scale="[0.75,0.75,1.5]" color="yellow"></nve-scene-marker>
      </nve-scene-cylinders>
      <nve-scene-cones>
        <nve-scene-marker position="[0,2.5,0.75]" scale="[0.75,0.75,1.5]" color="cyan"></nve-scene-marker>
      </nve-scene-cones>
      <nve-scene-pyramids>
        <nve-scene-marker position="[2,2.5,0.75]" scale="[0.75,0.75,1.5]" color="magenta"></nve-scene-marker>
      </nve-scene-pyramids>
      <nve-scene-arrows>
        <nve-scene-marker from="4 2.5 0" to="4 2.5 2" color="yellow"></nve-scene-marker>
      </nve-scene-arrows>

      <nve-scene-frame name="rover" position="[6,2.5,0]">
        <nve-scene-label position="[0,0,8]" anchor="bottom">simple rover</nve-scene-label>
        <nve-scene-model>
          <nve-scene-part shape="cube" position="[0,0,0.6]" scale="[1.4,0.9,0.5]" color="cyan"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[0,0,1.3]" scale="[0.2,0.2,0.9]" color="cyan"></nve-scene-part>
        </nve-scene-model>
      </nve-scene-frame>

      <nve-scene-frame position="[-5,-3,0]">
        <nve-scene-heightfield id="basic-terrain" color="magenta"></nve-scene-heightfield>
      </nve-scene-frame>
      <nve-scene-mesh id="basic-mesh" color="yellow">
        <nve-scene-marker position="[-1.5,-3,0.6]"></nve-scene-marker>
      </nve-scene-mesh>
      <nve-scene-points id="basic-points" size="7"></nve-scene-points>
      <nve-scene-lines id="basic-line"></nve-scene-lines>
      <nve-scene-triangles id="basic-triangle"></nve-scene-triangles>
    </nve-scene>
    <script type="module">
      import { POINT, LINE_VERTEX, TRI_VERTEX, writePoint, writeLineVertex, writeTriVertex } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/cubes/define.js';
      import '@nvidia-elements/scene/spheres/define.js';
      import '@nvidia-elements/scene/cylinders/define.js';
      import '@nvidia-elements/scene/cones/define.js';
      import '@nvidia-elements/scene/pyramids/define.js';
      import '@nvidia-elements/scene/arrows/define.js';
      import '@nvidia-elements/scene/frame/define.js';
      import '@nvidia-elements/scene/label/define.js';
      import '@nvidia-elements/scene/model/define.js';
      import '@nvidia-elements/scene/heightfield/define.js';
      import '@nvidia-elements/scene/mesh/define.js';
      import '@nvidia-elements/scene/points/define.js';
      import '@nvidia-elements/scene/lines/define.js';
      import '@nvidia-elements/scene/triangles/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/axes/define.js';

      const terrain = document.querySelector('#basic-terrain');
      terrain.grid = {
        origin: [-1, -1],
        spacing: 1,
        columns: 2,
        rows: 2,
        heights: new Float32Array([0, 0.1, 0.1, 0.4])
      };

      const mesh = document.querySelector('#basic-mesh');
      mesh.positions = new Float32Array([0, 0, 0.75, 0.7, 0, 0, 0, 0.5, 0, -0.7, 0, 0, 0, -0.5, 0, 0, 0, -0.45]);
      mesh.indices = new Uint32Array([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 5, 2, 1, 5, 3, 2, 5, 4, 3, 5, 1, 4]);

      const points = new Uint8Array(3 * POINT.stride);
      writePoint(points, 0, { position: [1, -3, 0.4], color: [0, 1, 1, 1] });
      writePoint(points, 1, { position: [1.25, -3, 0.4], color: [1, 0, 1, 1] });
      writePoint(points, 2, { position: [1.5, -3, 0.4], color: [1, 1, 0, 1] });
      document.querySelector('#basic-points').instances = points;

      const lineRecords = new Uint8Array(2 * LINE_VERTEX.stride);
      writeLineVertex(lineRecords, 0, { position: [2.8, -3.8, 0.1], color: [1, 0, 1, 1], width: 0.06 });
      writeLineVertex(lineRecords, 1, { position: [4.2, -2.4, 0.4], color: [1, 0, 1, 1], width: 0.06 });
      document.querySelector('#basic-line').vertices = lineRecords;

      const triangleRecords = new Uint8Array(3 * TRI_VERTEX.stride);
      writeTriVertex(triangleRecords, 0, { position: [5, -3.7, 0.05], color: [0, 1, 1, 1, 0.7] });
      writeTriVertex(triangleRecords, 1, { position: [6.5, -3.7, 0.05], color: [1, 0, 1, 1, 0.7] });
      writeTriVertex(triangleRecords, 2, { position: [5.75, -2.2, 0.05], color: [1, 1, 0, 1, 0.7] });
      document.querySelector('#basic-triangle').vertices = triangleRecords;
    </script>
  `
};

/**
 * @summary Kitchen sink scene
 * @tags test-case
 */
export const KitchenSink = {
  render: () => html`
    <nve-scene
      id="showcase-scene"
      aria-label="Interactive scene element showcase"
      style="width: 100%; height: 680px;"
    >
      <nve-scene-gridlines count="22" spacing="2.5"></nve-scene-gridlines>
      <nve-scene-axes length="14" width="3"></nve-scene-axes>
      <nve-scene-camera
        behavior="orbit"
        target="[0,0,7]"
        distance="96"
        phi="0.938652368"
        theta="-1.570796327"
        projection="perspective"
        fovy="0.785398163"
        min-distance="18"
        max-distance="180"
      ></nve-scene-camera>

      <nve-scene-cubes>
        <nve-scene-marker position="[0,0,5.5]" scale="[7,7,11]" color="#e900d5"></nve-scene-marker>
        <nve-scene-marker position="[20,10,5.5]" scale="[8,8,11]" color="#25aee9"></nve-scene-marker>
        <nve-scene-marker position="[-20,-8,3.75]" scale="[7,7,7.5]" color="#f5a524"></nve-scene-marker>
        <nve-scene-marker position="[18,25,1.5]" scale="[14,7,3]" color="#2e7d4f"></nve-scene-marker>
      </nve-scene-cubes>

      <nve-scene-spheres id="showcase-orbs">
        <nve-scene-marker position="[-10,10,3.2]" scale="[6.4,6.4,6.4]" color="#ff4f5e"></nve-scene-marker>
        <nve-scene-marker position="[11,-7,2.6]" scale="[5.2,5.2,5.2]" color="#63e6be"></nve-scene-marker>
        <nve-scene-marker position="[30,-9,3.7]" scale="[7.4,7.4,7.4]" color="#ffd43b"></nve-scene-marker>
      </nve-scene-spheres>

      <nve-scene-cylinders>
        <nve-scene-marker position="[30,24,4]" scale="[3,3,8]" color="#8b5a2b"></nve-scene-marker>
        <nve-scene-marker position="[-30,22,4]" scale="[3,3,8]" color="#8b5a2b"></nve-scene-marker>
        <nve-scene-marker position="[-7,26,2.5]" scale="[2.5,2.5,5]" color="#8c5cff"></nve-scene-marker>
      </nve-scene-cylinders>
      <nve-scene-cones>
        <nve-scene-marker position="[30,24,12]" scale="[12,12,14]" color="#2ecc71"></nve-scene-marker>
        <nve-scene-marker position="[-30,22,11]" scale="[10,10,12]" color="#38a169"></nve-scene-marker>
        <nve-scene-marker position="[-7,26,7]" scale="[5,5,7]" color="#ff6b6b"></nve-scene-marker>
      </nve-scene-cones>

      <nve-scene-arrows>
        <nve-scene-marker from="0 0 11" to="0 0 24" color="#76b900"></nve-scene-marker>
        <nve-scene-marker from="4 0 6" to="19 0 6" color="#ffb000"></nve-scene-marker>
      </nve-scene-arrows>

      <nve-scene-points id="showcase-cloud" size="5"></nve-scene-points>
      <nve-scene-lines id="showcase-route" width-unit="pixel"></nve-scene-lines>
      <nve-scene-triangles id="showcase-zone"></nve-scene-triangles>

      <nve-scene-model aria-label="Rover model">
        <nve-scene-part shape="cube" position="[0,0,1.2]" scale="[3.8,2.6,1]" color="#76b900"></nve-scene-part>
        <nve-scene-part shape="cube" position="[0.6,0,2.05]" scale="[1.4,2,0.45]" color="#a5d848"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-1.1,0,2.8]" scale="[0.3,0.3,1.8]" color="#d7e3c1"></nve-scene-part>
        <nve-scene-part shape="cube" position="[-1.1,0,3.8]" scale="[0.55,0.8,0.45]" color="#38bdf8"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[1.3,1.45,0.6]" scale="[1.35,1.35,0.55]" orientation="[0.7071,0,0,0.7071]" color="#20242a"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[1.3,-1.45,0.6]" scale="[1.35,1.35,0.55]" orientation="[0.7071,0,0,0.7071]" color="#20242a"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-1.3,1.45,0.6]" scale="[1.35,1.35,0.55]" orientation="[0.7071,0,0,0.7071]" color="#20242a"></nve-scene-part>
        <nve-scene-part shape="cylinder" position="[-1.3,-1.45,0.6]" scale="[1.35,1.35,0.55]" orientation="[0.7071,0,0,0.7071]" color="#20242a"></nve-scene-part>
        <nve-scene-marker position="[10,-17,0]" scale="[2.4,2.4,2.4]" color="#ffffff"></nve-scene-marker>
      </nve-scene-model>

      <nve-scene-label position="[0,0,12]" offset="[0,-12]" anchor="bottom">
        <span
          nve-text="label sm semibold"
          style="display: block; padding: 6px 9px; color: #f7f7f7; background: rgb(8 9 11 / 88%); border: 1px solid #4c515b; border-radius: 3px;"
        >origin / ENU frame</span>
      </nve-scene-label>
    </nve-scene>
    <script type="module">
      import {
        LINE_VERTEX,
        POINT,
        TRI_VERTEX,
        writeLineVertex,
        writePoint,
        writeTriVertex
      } from '@nvidia-elements/scene';

      const scene = document.querySelector('#showcase-scene');
      const cloud = document.querySelector('#showcase-cloud');
      const orbs = document.querySelector('#showcase-orbs');
      const route = document.querySelector('#showcase-route');
      const zone = document.querySelector('#showcase-zone');

      const cssPalette = ['#76b900', '#25aee9', '#ff4f5e', '#ffd43b', '#63e6be', '#8c5cff'];
      const palette = [
        [0.46, 0.72, 0, 1],
        [0.15, 0.68, 0.91, 1],
        [1, 0.31, 0.37, 1],
        [1, 0.83, 0.23, 1],
        [0.39, 0.9, 0.75, 1],
        [0.55, 0.36, 1, 1]
      ];
      const pointCount = 320;
      const points = new Uint8Array(new ArrayBuffer(pointCount * POINT.stride));
      const pointView = new DataView(points.buffer);
      let seed = 2026;
      const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
      for (let index = 0; index < pointCount; index += 1) {
        const radius = 8 + random() * 30;
        const angle = random() * Math.PI * 2;
        writePoint(pointView, index, {
          position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0.5 + random() * 15],
          color: palette[index % palette.length]
        });
      }
      cloud.instances = points;

      for (let index = 0; index < 72; index += 1) {
        const radius = 10 + random() * 30;
        const angle = random() * Math.PI * 2;
        const size = 0.7 + random() * 1.8;
        const marker = document.createElement('nve-scene-marker');
        marker.position = [Math.cos(angle) * radius, Math.sin(angle) * radius, 0.7 + random() * 14].join(' ');
        marker.scale = [size, size, size].join(' ');
        marker.color = cssPalette[index % cssPalette.length];
        orbs.append(marker);
      }

      const routePositions = [
        [-42, -28, 0.15], [-28, -19, 0.15], [-15, -25, 0.15], [0, -18, 0.15],
        [15, -25, 0.15], [29, -19, 0.15], [42, -28, 0.15]
      ];
      const routeBytes = new Uint8Array(new ArrayBuffer(routePositions.length * LINE_VERTEX.stride));
      const routeView = new DataView(routeBytes.buffer);
      routePositions.forEach((position, index) => {
        writeLineVertex(routeView, index, { position, color: [0.12, 0.82, 0.95, 1], width: 8 });
      });
      route.vertices = routeBytes;

      const zonePositions = [
        [7, 17, 0.08], [22, 17, 0.08], [22, 21, 0.08],
        [7, 17, 0.08], [22, 21, 0.08], [10, 25, 0.08]
      ];
      const zoneBytes = new Uint8Array(new ArrayBuffer(zonePositions.length * TRI_VERTEX.stride));
      const zoneView = new DataView(zoneBytes.buffer);
      zonePositions.forEach((position, index) => {
        writeTriVertex(zoneView, index, { position, color: [1, 0.48, 0.16, 1] });
      });
      zone.vertices = zoneBytes;

    </script>
  `
};

/**
 * @summary Replay authentic LeRobot SO-100 joints and commanded TCP targets beside the synchronized top-camera video. Use this pattern to compare policy data with the robot's physical behavior.
 * @tags pattern
 */
// eslint-disable-next-line local-typescript/example-approved-domains -- The pinned offline episode and its required source attribution must remain one portable, self-contained pattern.
export const EpisodeReplay = {
  render: () => html`
    <style>
      #lerobot-episode-replay {
        display: grid;
        gap: 16px;
        width: 100%;
        min-height: 680px;
        padding: 16px;
        overflow: hidden;
      }

      #lerobot-episode-replay .lerobot-media {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      #lerobot-episode-replay nve-scene {
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 6px;
        background: transparent;
      }

      #lerobot-episode-replay .lerobot-video {
        display: grid;
        grid-template-rows: minmax(0, 1fr) auto;
        min-width: 0;
        min-height: 420px;
        margin: 0;
        overflow: hidden;
        border-radius: 6px;
        background: #111315;
      }

      #lerobot-episode-replay video {
        width: 100%;
        height: 100%;
        min-height: 0;
        object-fit: cover;
        background: #111315;
      }

      #lerobot-episode-replay figcaption {
        padding: 8px 12px;
        color: var(--nve-sys-layer-container-color);
        background: var(--nve-sys-layer-container-accent-background);
      }

      #lerobot-episode-replay nve-card {
        width: 100%;
        --background: var(--nve-sys-layer-container-background);
        --color: var(--nve-sys-layer-container-color);
      }

      #lerobot-episode-replay .lerobot-meta,
      #lerobot-episode-replay .lerobot-disclosure,
      #lerobot-episode-replay .lerobot-status {
        margin: 0;
      }

      #lerobot-episode-replay .lerobot-meta,
      #lerobot-episode-replay .lerobot-disclosure {
        font-size: 0.8125rem;
        line-height: 1.4;
      }

      #lerobot-episode-replay .lerobot-controls {
        display: grid;
        gap: 12px;
      }

      #lerobot-episode-replay .lerobot-actions,
      #lerobot-episode-replay .lerobot-legend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 16px;
      }

      #lerobot-episode-replay .lerobot-legend {
        padding: 0;
        margin: 0;
        font-size: 0.8125rem;
        list-style: none;
      }

      #lerobot-episode-replay .lerobot-legend span {
        display: inline-block;
        width: 10px;
        height: 10px;
        margin-inline-end: 6px;
        border-radius: 50%;
      }

      #lerobot-episode-replay .lerobot-fallback {
        max-width: 46rem;
        padding: 24px;
      }

      #lerobot-episode-replay table {
        width: 100%;
        border-collapse: collapse;
        font-variant-numeric: tabular-nums;
      }

      #lerobot-episode-replay th,
      #lerobot-episode-replay td {
        padding: 4px 8px;
        text-align: end;
        border-block-end: 1px solid color-mix(in srgb, currentcolor 20%, transparent);
      }

      #lerobot-episode-replay th:first-child,
      #lerobot-episode-replay td:first-child {
        text-align: start;
      }

      #lerobot-episode-replay .lerobot-visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      @media (max-width: 620px) {
        #lerobot-episode-replay .lerobot-media {
          grid-template-columns: 1fr;
        }

        #lerobot-episode-replay nve-scene,
        #lerobot-episode-replay .lerobot-video {
          height: 420px;
          min-height: 420px;
        }
      }
    </style>
    <div id="lerobot-episode-replay" data-autoplay="true" data-start-frame="0">
      <div class="lerobot-media">
        <nve-scene id="lerobot-replay-scene" role="region" aria-label="LeRobot SO-100 episode replay">
        <div slot="fallback" class="lerobot-fallback">
          <h2 nve-text="heading sm medium">LeRobot SO-100 episode replay</h2>
          <p nve-text="body">Put the red cube in the right box and the blue cube in the left box.</p>
          <p nve-text="body sm">
            The 3D view is unavailable. The current observed state and commanded action remain available below.
          </p>
          <table>
            <caption>Current joints in radians</caption>
            <thead><tr><th scope="col">Joint</th><th scope="col">Observed</th><th scope="col">Action</th></tr></thead>
            <tbody>
              <tr><th scope="row">shoulder_pan</th><td id="lerobot-state-0">—</td><td id="lerobot-action-0">—</td></tr>
              <tr><th scope="row">shoulder_lift</th><td id="lerobot-state-1">—</td><td id="lerobot-action-1">—</td></tr>
              <tr><th scope="row">elbow_flex</th><td id="lerobot-state-2">—</td><td id="lerobot-action-2">—</td></tr>
              <tr><th scope="row">wrist_flex</th><td id="lerobot-state-3">—</td><td id="lerobot-action-3">—</td></tr>
              <tr><th scope="row">wrist_roll</th><td id="lerobot-state-4">—</td><td id="lerobot-action-4">—</td></tr>
              <tr><th scope="row">gripper</th><td id="lerobot-state-5">—</td><td id="lerobot-action-5">—</td></tr>
            </tbody>
          </table>
        </div>

        <nve-scene-gridlines count="20" spacing="0.4"></nve-scene-gridlines>
        <nve-scene-axes length="0.8" width="1"></nve-scene-axes>
        <nve-scene-camera
          behavior="orbit"
          target="[1.35,0,0.4]"
          distance="7"
          phi="0.001"
          theta="0"
          projection="ortho"
          frustum-height="3.5"
          min-distance="2.5"
          max-distance="12"
        ></nve-scene-camera>
        <nve-scene-lines id="lerobot-observed-trail" width-unit="pixel"></nve-scene-lines>
        <nve-scene-spheres>
          <nve-scene-marker id="lerobot-action-target" scale="[0.24,0.24,0.24]" color="#f5a524"></nve-scene-marker>
        </nve-scene-spheres>
        <nve-scene-arrows id="lerobot-action-arrow">
          <nve-scene-marker id="lerobot-action-vector" color="#f5a524"></nve-scene-marker>
        </nve-scene-arrows>
        <nve-scene-model aria-label="Observed schematic SO-101 arm">
          <nve-scene-part shape="cylinder" position="[0,0,0.18]" scale="[0.82,0.82,0.36]" color="#39404e"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[0,0,0.42]" scale="[0.6,0.6,0.2]" color="#76b900"></nve-scene-part>
        </nve-scene-model>
        <nve-scene-frame id="lerobot-joint-0" name="shoulder_pan">
          <nve-scene-model>
            <nve-scene-part shape="sphere" scale="[0.32,0.32,0.32]" color="#76b900"></nve-scene-part>
            <nve-scene-part shape="cylinder" position="[-0.151996,-0.091389,-0.271]" orientation="[0.49381,-0.821293,0,0.28571]" scale="[0.22,0.22,0.647752]" color="#76b900"></nve-scene-part>
          </nve-scene-model>
          <nve-scene-frame id="lerobot-joint-1" name="shoulder_lift">
            <nve-scene-model>
              <nve-scene-part shape="sphere" scale="[0.3,0.3,0.3]" color="#8f97a6"></nve-scene-part>
              <nve-scene-part shape="cylinder" position="[-0.56285,-0.14,0]" orientation="[0.170681,-0.686198,0,0.707107]" scale="[0.22,0.22,1.16]" color="#8f97a6"></nve-scene-part>
            </nve-scene-model>
            <nve-scene-frame id="lerobot-joint-2" name="elbow_flex">
              <nve-scene-model>
                <nve-scene-part shape="sphere" scale="[0.29,0.29,0.29]" color="#8f97a6"></nve-scene-part>
                <nve-scene-part shape="cylinder" position="[-0.6745,0.026,0]" orientation="[-0.027237,-0.706582,0,0.707107]" scale="[0.21,0.21,1.35]" color="#8f97a6"></nve-scene-part>
              </nve-scene-model>
              <nve-scene-frame id="lerobot-joint-3" name="wrist_flex">
                <nve-scene-model>
                  <nve-scene-part shape="sphere" scale="[0.27,0.27,0.27]" color="#8f97a6"></nve-scene-part>
                  <nve-scene-part shape="cylinder" position="[0,-0.3055,0.0905]" orientation="[0.598316,0,0,0.80126]" scale="[0.19,0.19,0.637246]" color="#76b900"></nve-scene-part>
                </nve-scene-model>
                <nve-scene-frame id="lerobot-joint-4" name="wrist_roll">
                  <nve-scene-model>
                    <nve-scene-part shape="sphere" scale="[0.25,0.25,0.25]" color="#8f97a6"></nve-scene-part>
                    <nve-scene-part shape="cylinder" position="[-0.0395,-0.001091,-0.490637]" orientation="[0.027577,-0.998812,0,0.040172]" scale="[0.17,0.17,0.984451]" color="#76b900"></nve-scene-part>
                    <nve-scene-part shape="sphere" position="[-0.079,-0.002181,-0.981274]" scale="[0.2,0.2,0.2]" color="#76b900"></nve-scene-part>
                    <nve-scene-part shape="cube" position="[-0.079,-0.002181,-0.9]" scale="[0.16,0.5,0.14]" color="#8f97a6"></nve-scene-part>
                    <nve-scene-part shape="cube" position="[-0.079,-0.2,-1.08]" scale="[0.14,0.14,0.42]" color="#8f97a6"></nve-scene-part>
                  </nve-scene-model>
                  <nve-scene-frame id="lerobot-joint-5" name="gripper">
                    <nve-scene-model>
                      <nve-scene-part shape="sphere" scale="[0.18,0.18,0.18]" color="#8f97a6"></nve-scene-part>
                      <nve-scene-part shape="cylinder" position="[-0.1405,-0.373937,0.095491]" orientation="[0.579894,-0.217885,0,0.785015]" scale="[0.12,0.12,0.821432]" color="#8f97a6"></nve-scene-part>
                      <nve-scene-part shape="sphere" position="[-0.281,-0.747874,0.190981]" scale="[0.14,0.14,0.14]" color="#8f97a6"></nve-scene-part>
                    </nve-scene-model>
                  </nve-scene-frame>
                </nve-scene-frame>
              </nve-scene-frame>
            </nve-scene-frame>
          </nve-scene-frame>
        </nve-scene-frame>
        </nve-scene>
        <figure class="lerobot-video">
          <video
            id="lerobot-episode-video"
            aria-hidden="true"
            src="https://huggingface.co/datasets/lerobot/svla_so100_sorting/resolve/13870ca969084d8ce4d8a0391b06cead78e804ba/videos/observation.images.top/chunk-000/file-000.mp4"
            preload="metadata"
            muted
            playsinline
          ></video>
          <figcaption id="lerobot-video-caption" nve-text="label sm">Top camera · synchronized live video from the pinned dataset revision</figcaption>
        </figure>
      </div>

      <nve-card role="group" aria-labelledby="lerobot-replay-heading">
        <nve-card-header>
          <div>
            <h2 id="lerobot-replay-heading" nve-text="heading sm medium">SO-100 episode replay</h2>
            <p class="lerobot-meta">Put the red cube in the right box and the blue cube in the left box.</p>
          </div>
        </nve-card-header>
        <nve-card-content>
          <div class="lerobot-controls">
            <p class="lerobot-meta">
              <a href="https://huggingface.co/datasets/lerobot/svla_so100_sorting/tree/13870ca969084d8ce4d8a0391b06cead78e804ba" target="[_blank]" rel="noreferrer">LeRobot svla_so100_sorting · episode 0</a><br>
              Revision <code nve-text="code">13870ca</code> · Apache-2.0 · 30 FPS
            </p>
            <p class="lerobot-disclosure">Joint data is bundled offline. The pinned top-camera video streams from Hugging Face. Schematic geometry uses primitives; joint origins, orientations, motion, targets, and trajectories are data-derived.</p>
            <p class="lerobot-status" nve-text="label sm semibold">
              <output id="lerobot-frame-time">Preparing offline episode data…</output>
            </p>
            <ul class="lerobot-legend" aria-label="Replay legend">
              <li><span style="background:#76b900"></span>observed arm</li>
              <li><span style="background:#7dd3fc"></span>observed TCP trail</li>
              <li><span style="background:#f5a524"></span>commanded TCP</li>
            </ul>
            <div class="lerobot-actions">
              <span nve-text="label sm">Episode timeline</span>
              <output id="lerobot-range-output" nve-text="label sm semibold">Frame 0</output>
            </div>
            <nve-media-time-range
              id="lerobot-frame-range"
              min="0"
              max="32.033333"
              step="0.033333"
              value="0"
              style="width: 100%"
              disabled
            ></nve-media-time-range>
            <div class="lerobot-actions" role="toolbar" aria-label="Episode playback controls">
              <nve-media-seek-button id="lerobot-restart" action="start" disabled></nve-media-seek-button>
              <nve-media-pause-button id="lerobot-play-pause" checked disabled></nve-media-pause-button>
            </div>
            <span id="lerobot-announcer" class="lerobot-visually-hidden" aria-live="polite"></span>
          </div>
        </nve-card-content>
      </nve-card>
    </div>
    <script type="module">
      import { LINE_VERTEX, writeLineVertex } from '@nvidia-elements/scene';

      const encodedEpisode = 'H4sIAAAAAAAC/6y9B1RUy9L+DSKIGBARVMzxmBNigOnaM+aAWcw554wRlSAmMEfMEUFFEUzI7r0RMSJmMeccUDFi/vpp7szVe8577/9by3ct17vWnDu/2V1d/eyq6urGu23D6ok2VlbOVpn/l1q9j5oUdlhPy79N8RywUVnXJU6ZM+Wo18NkV7Xb8US9f2y4Mm3lRsX140Hl6/p3nt71KtJIm9Px1UvVYcnfKlLD7HfiP6UxNme2PftzrNl/jJVy+vQffC57+lOsHdsr0J8bo/cfY71+NYL+4Dz+MdaqsLA/aPvtf4ylxsf/wXk8/cdYt2/d+oM+8eqPsYTkKH9wPf4xlpOTk/LnfLXgH2OVLFlS+YOa88dY7u7uyp9bQ15/jNWgQYP/vyyv/6Kr/yfrfLuv8f+LlfVLRYqf+UiyfHx8/hjr9q3u/yfrhuPJv7G+1y9g+JVV/lNFypX1pWQNGDDgj7HEu+O/2H75/2R5vq9IngFvJWvChAn/7bkO/S9WkVcVqcyUn/Efpeb4/zFWgwYz/hvL83+xdj+pSHU97dSPme9H5U5a1f/LXl7/5PclWUVKe3FVst7crUih+3NKVsrpUAXz9X8812+sxC8HJOtUzYq0q/HL+GqCdf9sRXJNcVTbnIEWLhKspv+Thc/NrMtVKtLZKp8la3i2SjTngqN6pAUJv1+mIM78X6wKazcozXpmjnFBuYq0w8FGBWva80rUKsNRPdrViBjg/4nldmn9P7I6H69MX3LlUWf0qSfW0Nr/J1ZLtl6xq/x31qnBVcjdNY+6+mF9odGb/p9Yi0eut9jrV1aRalXosH0e9WmX+mI9hv+N1aXc31nHrq6zPNfFMhWpk42NmlG4Dlt/pQp9Lp5HtX7ZAHEOfOKQmfXRPdOP/pN1wHGd5blK9qhItQJ/xj9cUofZRFelIVXyqLUyGom1ves3n8B8/SfL5/lWZaywq5kVYl+J3n7NiO+ay5PtnF2NdtXPo/a/7S3eHbG/sTbV+TuLq1skyzzGaxMqkVV6Rvw+By/Wc3J1qtE3j7rwe3uhEwd+Y/Ww26BcOPI7a8jhzb+x9u2sRFdvZsQvCvJiaawG9RufR21ypCtiud9Y8KP5i35nXViy6TfWzHuVaO6JjPj4b17MvbQ7/QzNoy5/0VdoTsL/yRJ6L1l23zcqVXf8M8t03J2K5Mqnxi0cJDQn6b88V1MDWImnNip98621+P2vrPFBNeng3KJqmU1Dheac+I2VuvHfLKFrkgWNqB+4WvnYN3MesxSsTC5HhL38DKwa1aI2niXVwH6jEa/+5qtYK2aW0C/JirHeqLjHrVJG/NwvWQsDKtPNl1nUelMZ8x5amwJtKqsuyROE5pyHr3qZWV9N6yysW9NUyYKf3OFhSoWUTJZxdhWaWS6P+iqrke1Oq0NbStRRi5b0F5pzGbpqACvyUbi0y7/HeN9wqU+ijrWYUHGl0nL4Psla/KYqlW3vpo4b1YA5n/Ik1xH11SMzZgjNuQa9l6wSAeFKu+Zr5HyB9djTgRk8DuvKuHXKsGorlGP2mayheaqTq0cJ1a9CUxZy14uCh7ZVy/WZhZhceew518Ka8GKV4rn8gGT1D8rDcl3X9G2N1ioFPJZbWO38apCdUk5tkuLNWh4wUMO5HdSrZ2cLzbmvwC74fbBgF4xl+Le1iHOY09N43bHgGmXvqKVK1RuxkvWqmzsVvuahxg1syXa7Er073UUt7zVXaM5j5eqGy4ZKwxIkKzRxpdKj1n7J6rW1PBP6ow8suUq5lmeJcuNOjGRVtK5JxYsy9fyclmxyrEKNTg1Q02vPF5rzXBH+bTi5TZOs6D4rlNTzmc/Vo1YtFpi6V69zfIXi671ImfVwj2SNHl+TBmxorMZ4eLN2fiaK6jJSXV11EfIOBTb2cVP1SXO3SLu8iIiVLOHDrOOc3br9sGVKis8CJb5FJqvQLQ+q9qKlmmrVnvWoWZ8WvZ+i0pjFQnPeKbAxxgL/zti0VCmWN5PVuVMrZrDdoS+7vVjpciJU+M5uyXIcXYdWJrZTJ8/tw17kaUSTn/qr+TcuF5rzSbnfrRR7vGq/Dh3G9xybxkjW1Q0+zKPTFt3n0AKlwvC5SsjbXZI1n3mRo0sv9faW0ezeiia08UyQ6llqpdCcr2IeDSzZNUZPfrxaSXuyUKkfs0eyyp3xZ0IfdNfloYrSYLZS51OUZM2ax2hfzVHqmwlTWO6XzSglabF6zDoMuZURdrlUY6d+7v1KRQudL+0CVv+ghWx1SJieOnqOcmP6TMX7zA7Jcr+h0Om2k9Spfv6Mn2lBRs91aql664R/ZTFiLCnBW/WF55YpF/pm2gUssZ5YUt1lertCM5WfxYKVjAvbJav1QxOVLBqgXjsfwDosak02dhFq1F+bhX5lNYo1xMT61eFDsAvGApbwEXar6EJ9Tdcg5XWHGcreDZms4k4NaExksJp0OYh9KNOW3FruVndV2Sx81c4Iuwh9kjbOcWO2IsYrWeL5mLCV/r5fgJLvU6AyakQmKzW8Ea0ZuFCt23U2e1WhPbnZHFAzZmxB/mgs23MeE1olbVx1yqzfWGKt6hFbpyt1VgQolQyZrDpOTWl9WJh64koI69C6A30ff1BdmBEu/N7BKMbHgl0W6+J7Cmyz0CqTJWIB1vfhTH1wgJ9SwNbfwgpObEbN1oerBTuFsoutO1Hk0ATVb/g2oas5jb22RrLJXebrmHf3OTPkfIEldJCFLg7U3ZZOVA7PnaxsuRKZqRNnvemG7S719ep57PHGrhQ95aRaeFOEWEO5jRtO7mSetUL0YjEzlU7lg5SkwZkst5qn2aaMifrq5mOU53XGK+I3lW8H9nt9XdaSstTdo270mc+CHHpSvscX1C4XI5Ajy+d60WSWjmcaZhUg5z7T7y+ztG2DdfFPKRU9RikyNlLGvqtXtKGvefeosf0Xsi93+1Dj1zdVx9ERYj06GzH3GEvC1wBljvM0+R2whEazszO66o+/9FG6/TVSOTkhQvnW/6Ghb3B7KhoTrb5bu4g9TetPnleeqqV8tgq9dzEKvWIxhyfp1runSrv8i+W5dN0LNul5a/21a3dlxuUhCuKdr/NbsIsjOlK1aVxt32AxGzh/MLk4vVN/dNgq1nZ+Y+dOZ1ml08P0MWvHK/gHVn6vzobFVTPY86tN9d1vOys+kwcpiHfAahPZhRqtPK+a+ixmiz2HkmujH2qOwZtRBzBiLFW8eunv2o+SdrlmjFSGXv9ocJr4g5Vq3UjfUL6zYjevnzKnXSar967uFLzxnnqsxCI2zXk4BY7Pwgs+3yR0opARY2lt8NGXrhsq7fL97jalwOlKDCwbrYFe4GgnRfyWZH070Y09ytqLag59rnq1ms9KtR1JS5fZ8Hnrt4j3UBHJ8jzWQu9ff7ACHt6TX+OrS9bDivUl606LbkrDElvFPK5kH1J7U/mPL9SUqSGsa/HRtHtiVl60y1ahOcUlS+iOnuIySGm4Z6DidHCrhbUlm1GyRp3poOx6t1mZ8uUqy7m3Lz0KTFMr/TWXFR0/loqG2vJHDltR6zD6TH7KnGc11D2eDlBG9OyrCP1Rbrv1layUfV56Ro2Oimlse8nyq/mUHSw4gL60SVMTQueyE8/G0YmGdrzaXmhOaflcl/rUkyzHyB7SLsInWLkzVvR4VS1d2FJxKtBWSS+zRZky4hN7/G0gnRicrsZvmcOiho2nxh3s+es3G4XmlDU6P0ln3/OQZDUu3lXaJdZZk6yf06vrYX5tlcElWsvn4npu6vlmEE3L/0m1Gj6TffOYSDvqZucDam4UmlNOstZ1qStZsI316y2Ke/NLkmW/pqIu3kdKYoWWStkFmxWWpTqNNwj/7PRJffMggH0qOJmWlXXglT+tRz3H2DbHB3ZAqSlZTwd3kKyJfd5LezkdLKMvPttc2bTSW+mSsUlRtzWnYz0H09RHn9Up2yaxuU5+lOVodj7fbr3QnEpG+HeThCp6VNAAJS53ewUx+K67eQmsTXWK6+12NFHAcz22SZnSvQ3NXD+Y8s3+psZpI9nWkVPp/kgHfs17rdCcKpLV5mY5/dig3gpsAxsXW1hRsm7sLqzv2NtIEWtJQQwc36AdbR86jIIq/FSPBY1lObJOpw3lc/CsOdcKzakuWeJ9q3d81lURa1myTvb0lKzQxAK68H0Fz4b3+pQvnWjbmpFUu5Q1HxM4iY3L609Re3Lw4ptXo2YlWQ45iun23zoqF961lPO1QGlAsH1SXRdd+L4SP7WxZB2a1of2NBhD84dk4a8ip7KQ2f6UHpSLZ3VdJTTHQ7LiixTS4Y8xvVtIG/d44C1ZuSbn1bsdr6cIX5Ysv5qDqGjQOJo9wobnGO7Prrz2p5Evc/EVxVYKzaktWSJuk37kVtNb2qX0kQ6SFeySVz4X/iGHiy80hI6P8aXPZ2x4I6uprEu/AMronJt7+a8UmlNXsorUd9atW7VRxrBmkmX9uptkfY92kiyxLhTE5l7Ph9OlGeNpfPusfGn0JFZtQQAVDsjNkycgNvGS/oWxpAe3VpIbNZGsR7d7S5aIp+QYwZLPdXA0mb5NoM/chj/d6ce6Lwug0JDc/P6wFUJzmGT5ejtJFmyMnOX4mQFyHn0OOereP0yKwcMkWVNGTKAJZSZSVIoNz+gymd1zDaTWUbn4MTFGEebIMd4qmke/p7ZShI5KVkzgEBKxJ6tVLreeFGZS9p4zyjF2n+RPCT8mUslgWz7Bcwob7h5INfrl5OWLrhCaU0+yGqbnlusupGRDpVnVTcqCXaMIn6/7klPHMy0lRRlxdoNS+PQ80rZNoog7tvzOmcnsUXggVR2Zg4dXWIHao2SV7ZlLsuCXeK5+rhPpUuIrNm1QDl3ooSJ0RHk8ZINys+hqmuE/iTok2fI158czN1MQPTybjT+OWyE0p5Fkza+eU7KGLawvWVmdZkjWiPUOeq7rpPjuZJJV2G4tjbs3iea/s+Unf4xjOcKDaHwVe97w1UqhOU0k66NNDsnCnMEnT72ZR9Ci4xH2uohB5XMhxwIryH4yjclix9M3jWGjxW+u+ZCdf70ZJjSnmWSljs4uWZgzsLZPWyJZE+Kz6kLbpL2Qp4Ll5TaZnHPY8d5VRrIvvWeQX10H3n7FStRXJavqlGy/scKWLif4SgFbK33Ez1pK4c2KzOvB2rtlEl04b8ut1w5me5bOoGmpOXjDxsuE5rSUrNcdsurQTjNr8bkVch4FTztm76EE+5J8LvXzWiodM4m6X7Xl87f1Y9bfZtDC9bm4b/5FQnPaSBZ+v++4ppKFuZ+1PUyyxDtKWxFVQ9oe+fOt+E207+oUunTRjh//NJDd7RxMuz/m4mOyhQrNaSdZgQM+aatfNLQ8l9+M1dJXw1PvaBMKVUcOkPlcy7fSqkZT6djybLzC4IHs2KFgSj/qyMffno0asmTtrZam/bpWhqxaJ5+rdsfr2sC21RT+0lOyDP0jaVfF6RQ/2Z47Lh7A4srNpMCk3HxclllCczpmzmP1+xrsC7/EWukcvVGyMmpckSzMJVh+3jvIL7c/5X1pz5/E9mSrhs6kSFtH/nZtsNCczpLVuPgNDfMOv0R9qNGxLZIV2fCiZNlVriPnESyD0OWmT+y5nVUndmTOTOrwlyOv1DlIaE5XyXo6OFWyYGN8pw5tkz7RbMEZ7WzpqiI/rSVtvyZ3NE1y8afwW/Z8yrC2rIjnLOoutPDW50DUySUrzO+CZMHGyPurT46Qayh+6nGtzqfKCvwCn8ef20vzS/tTnzv2PPlbCzZyzSxqcjYHv1jDX2hOL8mq8P20ZMHG+E6hKjsJcYbInbUNJyuJnNJdPi9YEbX96Vu6PXdKbMy6Vp9NGe8cuN2rKUJz+kjWjr3HJAs2Bivb/d2E+EfkC5J1J62qZHVL2kfZvPyp/gd7bt3FyO7smE1Ob7Lz+zfGCc3pJ1m5rmuS9bFvbcn6WWSPZIk8Rsu4UEHBODGPYO0QrPuCddKxNjvbfg6lBjvwltlGYi9AsqadOCBZLYdn2uX9pxhy6fCIidhCMzmXU8pVqWx5roKN/cnGOjuf+rAKs74/hxwWZ+dzdwwUmjNIss6W3i1Z28a7S1b6sljJco9bpYn4RCnQv5LUL7A+VBPvxBf2PL13aTa19Vz68D07H1i8l9CcIZIl8gXJmvWwuhwLWIivRc6ldckoKfKtStLvwCr+aTo5Jdjzz74Fme3DufTDITsvndxVaM4wyRL5o9b/gUHB2sNY0tz30opcd5DzaZ4DSij+tStaWNVM/lTdPjv/MtCJvakeQr0virVZzQf7HZIl8lANdoePY4xgdXx2g4lcS4uxLiFi/vJSP8BStwfQ2K4O3CvQiZUcE0LdF9vxoCEthOaM/peuztGq3nBX4OOwC1gFjl5FbqNVWFtcxOll5ToFK+fTQMoXnoMbjfnY46shFDHKls/u3VhozljJwu/jmTBfGAtYyNMuJY6QrElzS1tYXTrPILe8uXjtuPysQZlQMtTIyl2amITm+BqxVvD7CV2rWOxiZom4U7JgfzOroSmYbsZm51aNXZljy1DqL2KLQ0cM2NOR8f3easO16MWVpV3MYxRrFH0aknVhyb9Zy7YH0wfPbHxYISe2u2EopaRk4WrXukJzJsnc6uORvhrGF7frL6kHZtb+9b3+xrJ+EUyeoVn5uY05WZ/aoWSVmIV7OdYRmjPFiPlakaunZMHGZtYNx5PycxH/Shb01rD+IF3+GUzDjllzt4vZWWKfUPpw+Zu6PE8doTlTJUvEqn9jrX5xVGh0F83tUjHJwnvg5uI4Cr0dTHGR1ty/dzZ2tn8oBb78rP6c6oF9KyPmXuQIklUioKz01Wfn9xLqACJWlKxmVUvK2AAs7X4w9WpmxV8MtGUZirC9+lG1Cqwq/CtAskRcb2HB9nd27KfCm3Xkb5IFmyHGA2tLTDDZVrDiK05as63dQ+nwu3dqz+3lhX4FSpbIHyUrrHBZ6RM3mh6gW9NUJt5L2uKRxRTwwPKbeYimhwZTai4rbtr/xVBtfCgVc0tXO/QtI3w1SLL8OjeQLOvXpX9jCZ2VLPwzs3pMCabQHz/V26teGQ63DyXt6RvVZkdx7M1J2+M70JUhh0tZWKjBTDtRW7JE/C/tBZbT3mAat8qaN6v0xNC/QygFP0pTg4KLCr8PNsKPaEtNyRL5h/wOWKg1CJ3/jVVocjwt2RJMxtNfVMXvtqFw5VAaFPVcPbPRTejqTCNqLULPJQtrBXoAVrG8sUysK8sYEXuCNWRRMG27/l69e/qKYeSzEHrV54n6rr2rWEOzjJgvfOdX1sXgg5Il5vU3VrfenM4sD6aiy56pS3tcNmxcGUJh6Y/V+/ccsf9ohI2FpltYWCvnSsUR6l/C56XfB4UXlbb/1l6ji+2Dqczgx6oam2yIahBCh6c+UKtWyi7W4xzJwnfAMq+VY98PWViJp0ooffMVkc8F1gvXYMrr+lhNG55gmFIghOyaPlB3FbETej9XjrHUm4KSBf8G68jqeMkSDKn39QMLSduDtfrBDDq+8qm6MfSA4XvaXCr64766OcJarO0QI9aKyK0kC3oMllZXlSzB0NLLlFbc49zkegSrdp5gWr7jhXos5z7D89VzKWXGfTUH+2pIOR1qxBo2s+Df/8nCWlgdUtDC6tcnmIp9faVe6X/A0OWvueT+8J6adCXdcPvWvN9YsPGvLNhL5M+K3+f8cg8QrFoiFvQJeq0OPhpn8I2eQ0Xr3FOXFXlpeP1qvhE6ZWa9mFjkN5awuwbdvpTF1cJ6lWMmhV99q06sqBrqdZtDhZLuqq12PjRYWS2ULJELyxgk+XGhv43Rfk1FRfx3yxgz6s+k99XeqRO3HjLULjuHXgTcVZdkvW5wclpkYSH+2NHe7TeWyLnkcxku55MsgyGBdM+ZNLTkO7XF5/0G3+uzaXbBu+qZ8icNJUsuliyRC0tWvr8K/sYS+ajWa2t5xXudS+baLpVILYbNJP9R79QzQXsNTTbOpq8X7qglfA4Z3N2XSJbIe35jxTprkiXyGP40ewU5RjNrz+dgehz/Vl1weauhr8dsakt31I7ddhoaNFgqWeJ9y39lRbXSpU6ABTuKfNzCCu0utPBouqp0X2xoumQWtS78UOXdNxh8fJZJloiPJCtrjwKSFZmmS/0Cq0lCFUXk8BbW/eLBZBiQrjbqHmwoW3kWOQx8rCZXX2kYMGC5MfPddYcjlhhWLb+FhXUKFmKDtCd5LKyOZ2cQf/RGjWw+0RC5fyadXvpUXb93oWHChBUW1s/p1aWN4UdgYZ2KPIYfUGoqu47ksrDK1JtBCxzfqFUe9zXkFnnHoZXP1e43ZhnmzF5pYTk2raHsHZXvN9Y212wylhK5amaeJFhz6s+gBKc3arm1PQ3RTjPpyYjn6g2HuYZVYWEWFmLVXJPzWlhY85jfqFKeitLA3sLKOSmItl94pU7P3sBgw4Pp7pGXapFugYYd21dZWPMX1VF8Djn+jZWyz0spFmNnYXV4Eki509LUI9sqGpKCgsl/2EvVy2OSQY1fbWE1bOOllO2Z6zfWwLc2Mvb8WczWwmrRJ5CGFEpTHzZ1NTjUCaYXGS9UFtdXaM4aCwvfsUvJYWFBP5wm/uBpjZki8m6L7YeXDSRH/lI99t3BcP/xDOra/pXackxboTlrLSzkaI89HSwsfA6f+E+WOw8gJf9LNfbpRy+/eTMoefkbtW4FRWjOOgsLMXmrXNktLNTPRZzHUU+4O8/GMsYKzwJoZreX6lbDJy934wy6v+OD6rChktCcDb+xzPMFFmIDsJCjJny1lr8B1poywvZJgtXtu1fRN0FU2v+7er55CaE5GyVLxAGSVXVKNstzgSVyNY66UHQNa7kewJrXNJAGv3+pzr382WtYXBClun1XV38rJDRnk4WF/Njxma2FhTgD9kIeLrRHvjdvVj1Mb/oHUskSaWrj2Pde68cFkaH/T7XdtYJCczZbWPgO5v4/WaijmVmrm+jEEgLIvvBLddXps17lmwTRvAI/1XzjXITmbLGwUBfCfP0nCzW+X1nu5QPItsoLNSAq2ivv60B6Mu2HWjk6p9CcrRaWiMGU1x3+zUJ8DRY+L2H6SeY4uu5Lf3qd8lx9s32Tl8feQMp2zpqP8ckqNCf8N5bwcwtL1vUFC/W19EffSNbSjDvpUvYAWv7tufpow1Yv45ZAqhCQledpZiU0Z5uFhRpqp/KZfgSNlnX9xFfy83uFM1lrRkeQovnTkXnP1bVNFnv1nRhISw7Z8rbL0r3mzI6Q8RdYqDvDjzD3iKOR28C/UEOMOfyZEC+inlN9pj+tv/pSnRYc4LWmXiDNfGTH9+1I9VoVFinjQuFL3L1gYwurwOmdsj4BFmqbY9Z+JNTS1G7LqWktfyrA09XYoz29QosH0uRp2fknm5NeO7ZvNyLnBAu1VcwXWKhPoDaE9wA+r1/vPSHuv/kwhN7emE7DHL6pA7IoXj8zAqiES06eZesBLzV+h8ytwBKxvCJ0gWCvPqnrZa0WLHxeKvotIXde2yuQ/NKnk3/JLNyw1MPr7ckAOr8pNy87b6dXyumdco8CLNToYWPEf3NzhlGTXlngFxx1sQchrwn57pQc06n1qen0ubQd/9C5rNeS9ACqXCoPH/8s3Ov2rajMWppgBdo1lzbGGJMqLZAsrHn8hpgHC+tC/enUcaY9T43O6lU3OYCefHXkgxxXer1+tcsIu5hZgivn67JrKAlfg+9bWMi5Jp8fSdO2TKegLA78bJyjV+7dAbStvhNffH6+l5VV9G+swAGfJOvm9bl/Y+G5vvXvR6PuTKeVxRx46f0uXkejAugrc+L1ts/3cnLaI1lC9ySrz6UPkvUqaRbNmmFLZjsmfU6TLOwrOJ2eTtldHXilR5c8ewrWx7V5ee1Rs71Kloz5jSV8SrLelp1F4t34N5bfil4UaONPRdwd+JVbdz1LhwfQ1Y/O3EOw3N1jf2PBj35lYYyYR7DQuwPWx+L+VLm1A69w/6XnlKfC9nXy8S3eq7waNNj7X1nwCezB2BRNtzzXr6zs3wLIrm0+vuriHi8fn33/lYU1VP9+Y+mr/8R63ziQ1m7Kx6tFnvUaMGD/f2UJ+8l1ijn5J9buGYHk8iAfzyj4xWvChAP/lSX8VYNOwO9gL68WA35jVU0PpEdtXHjFLQVEnHPwv7LEe1yyDs/98o+sywWDKOdUF36saTUR58T9Vxbifmih9e7v/8jqtDCIrn9x4ZeytxdxzqG/+Sp0ysxCbvX+fX2pt2ZfvXJsOr11EKz4i57v2wdR5QQX3uDhABHnxP/Ggl2gU2CJ8ZHImTXswxy4k03W67A3V955Otnuys6rz9rtGeQVRMPuFOSBe/xFnKNK1tUNlyULYzGzRPxEyHcRA8yvnlOyvlb0oSznp1JBx+x84slwz1cdg6h2/0K8054lIs7hlrX9ZWMzRcybrJtkPA/GXhqhDoA4x9fbycJa3cCP5ja353O7BnveNATRhcnFeBG7rSLO0YzYnzKzEAOA9d07GPuFIgZrKONC5FbQHLD6FZ1MZebZc+89s+qWLx1E0/8qyeudjhNxToIR2oJ3F1gj1jvI3wdLxPqEOo/HbE9F5L2ylw6svoMm0q2wHNxzfphnm2ZBtNWtDJ+W77KIcw4bYWPEkmAhXsXvgyVyNPLNOUQro9dVvpqKKg45Mm0/N3A87XJ14kUbuXhlzxtEf238i3c99VzEOYnGrducsZ8nWYjJMfdgCX8Q76IpmuvHOgry96DwdUr8vS706dw4GrHClY936es10DmIpliX54VzWzN39yNGjAU5J1ihiQUsYxQ5La1oMVOyUOdB36lXdA+q93MsVbJx4/Wb7vMqfiGQaHRFPinaAX2PRmELQg0GrBu7C1tYwreoVrn5MldAnoyeTLA6bRlLuVwL8YwUa0OPeyI2aVWFRxXOz3x8jkoW5gss1DXMYywRUJaW3V6sid+RdXKwoBN1uowl37tuvOvqMoZlpwIpw6o6b1y6BBsw4Jgc49UNPpKF+gF6AMESOahYj8s11KixR4R+PqyhDxFjqHb+grzF8PoGuwOB5BnpzmP7VWATJhyXLNQxsVd7ckI5aRewhM8T6uQd51RVHq+qpayYukaube8bo+nj4gJ86dOehtvhgTQorja/2MIdvZ1yjEvXDZV6gHoaxgJWsbzuWOcy38XeBfoYsY+8+dxYOpi1EG/VL9TwsZkY4zAvfvSIF1sVdtIo5lDop6+GfSbkfehVBevWNAO1uRkh68HYn/nZarVkbZzmS4WCS/JtDyINL+MCqP+berz3EPQhnzKKPJ/qrAjQsP+GXO3FxExWt+P1ULfSkNcixi71Jkyy3vQcT+9eVODdahwzpA4JoNPvGvPria2YGp9sFPNEqJNjDWPvxMwS8Q2l7IuXLMS/6IH7kmUYLbQfT30X1uAXMm4Ybjzzp5k7vXmnXJ3Rv2rEWLB/gNzKx82goAcPrM6dWpHB47AcI3Ta7/MKydpwzpc2ptbhzg3TDdd8xHvX0IY3v9SD3b6VYsRYxPNLFnIP9L2CVbtjF8JeD2yPOX6/dIXcd7/5cRxt6MT4pF1WrPPlaRQ+sDP/fKgve/3qjFHEkIi3JQt5Afo7wXLp0J8GlzgnWc0WtFSEr0nWC/tx1HyCkSeuyMbGP/Mjj469+ZjNw5iV1Tn0BJLJOUKyMBbYBaxLiSMIe3aoT6Dfo9vATNbn42PoTayR2yXkYhc7TqEzZQZx+4aT0aNrhF2wpwMWxoJeTrAWV51Ij7/c10aNqKCI8VpYxvqj6cGCBly94MzW751EDa6O4CMKBLGSJS8YYZf5iw5KFsaCHlqwBr4Nov71n2mo6VPW3tJeiOX0rSNpfC1vPiexMOszewLtDZ7Mc/eaLTTnolHoHXJrycJYMF9gPfacS+/av9FQ756X3k/2/II13XM4hdh35KH7yrCkbOPp/tcAXrDqPKE5l4wxhyeRw9BkyUKvl5kl/AT7mZKFPifYET0PXdgQcvnRi7+yqcRsTOMo+eEs3r/xIvQhGzuVD6I5secla0WunhaW8A0S7zjJ+jZqiIL+WrDW+A0kj16D+ITUqmxQ0TEUaJjPR+5YIjQn1Sh8HvGfZKE3DmMBK73MFsT4Olh7qw2X69Frli+Nmt6f9gwYxeP2e7BPUSPJ8cdSvuzFUqE5V4wN0+fT/vV3JQv9Pll7ZLLE3OKdomPf4kHIyEzNEazGj/rSuYkT+LhHBla78HDamb6GHx64QmjOVWNS3WXk8fSxZKH/D/3DmTqhEnoLsM8z9M1Iod9rZF9H0yp9qHbYdJ7bpx4rV20INV8Uzt2fhKHX2ig0mbYMfClZWwYOk3YB6/nVk+S6PKeO2iNY6OkGa7hLL4o+OpNHl2zMyrGBpDlH83NTVwvNuS40ZweJWEmykj4Pl/3WYD0dnEopPo469BEsaDRYjTb0oHxdF/AWr1qx/ov6Ucdscfz53jVCc24YhZ8iJ5Ms7x4jlFl7M3Xi45EHv7GgRWDd6d6d/PuG8QnHO7H6BftQtkuJ/OqBNUJzbqLuS9E1rHW5thNHWDQHsTNYWI9T4kZJ7Qbr8/OulNB6Mzeu6s2s2/ekgu1P89iXa9BPjlyURKxmYaHnW77TRL6O/hwzC9oNVruWXehlwE6+Qx3APFd2I5fQVG5asE5ozm3konLuwUJ/IeYeLMQ86LXBPrLzk9GWMV4s3InW197Hi48axOY360KdT93hO1ZuEJpz1yjmkNALYmZh7sESc6hgjPAJ9EOan2vKLR9qPEfjKQFDmGlzR1oz4hlftWuj0Jx7RsTIP4vZShb6KM0s1PvAwvsfz2X2iWeb29KioOO8co8hrNVYH3Ip+ZZ3P70JPfNG1KPMLJuioy0s1FrNLPTDmlm5eCv63ucsLxI2mBUb1ZYenfvM88/fJDTngRH1s39iIeb6lYXP43yE9n3xpv7OV7mbYH0LaEX9T1hppWdvEprz0Cjs+48s7GGhNwpxAVjwO7DixzSjF+vu8AKCFfPUm65Pzqqt2LNZaM4jI2LRf2KhPo7nwh7Fjnxj5XoAq+zlxlQy5xPuIlg7pzWjDN1ee7YmHOcCjNhj+ScW3rG7juTS8Xz1642T6xSs9a0bUo/badxZsKzdmtABllN7uXab0JwnRuyrg4U+jJDA0Ra/x343+pywN4N+W8QAYJULqUcNbT/wC12HsNJtG9Kp0Y7aumURQnOeGqFPYKFWi7FA88BCPCDiYh37KeKdpKwOyWTdJxPN3v6dh34bx+oF16NLjs5aK/sdQnOeGbFGwEINOzl8nGVtI74Aq13zwopn2clKp86ZrGyXFTIttdEWBvqzfSOMdG2pi/b2TBTOPhhR0wYLvRvoqY4vkslCDAUW9obSH/lZnit6OBG3sdeqz5zJhpUhSnmdX0s8GS0054URsS1Y2NPBWHa0z9Qv1NDQS4a9obCb02RsAJbvLAP5xubQzhYMYUPXeVFGbjet4549QnNeGlGHBgs+gP5oMws5e4/U7Dp8plttf/k5WKsiPCmXZ24tot58dnlGXWpZprDW6PoeoTlpRsQ2YFVv9peCnnZznOMwtLkCvcd+DnrD8TlYvQ7VId+4PNpS20Xs4IraVGFiEa2W1x6c70DMJFnIB5wmTrOwPI+1kCzkIujnN/tq/MdatOxtXq140hLW/LsHHd9cVNs/fI/QnDdG9FeBhb1a9NmbWegtQ79apZz5FPSaQyPBquDuQcW0fNrrccvYu+Sa5NO2mFZ3QYzQnHQj7AIW9jEfrv6dBXsJbVVwZgH6BZaDrzttLeKqhedfznr95UEL9WKabcABoTlvjchnwcI+pnksZpb0O5Ef40wG8jewPFZXpz6vXDXPx8sYxXpQ7z7FtasR8TjDYkQvL76DvcfQxYEWvwdLaL4G3XfbMkfWEaVP6NUo9838WlnflczBrhatOFpce/WOC815b0SfHN4d2PtEPz/eg2Chp1JoroZ8/qNNiNwL+GqYQo1rV6N2VQpqxWzXsCkPPChn8RLasnua0JwPRsRv+H3sc71oMkueTwQLPdF4b6K+1uxniOyRBSsupBrFZHPT3nXbwKLyetDtY8U1ZqcLzfkoWTGHP2taaG6lVa45cn9bxjnBrVEX0DZlZNC6L6GyDxisUqnV6HI/N638gE1s5G13KmpTXHPppOGcjmSJ/72G9w7OZaBuYmbhHSyejd5+mCf7zMFqsa0aDa/hpg07uplNv1qDyn8qqh2N1oTmZBjhk2BhD2baoEy7mFl416FmMafUAgXnnuqWnkqJwdVoWNWCWtK9zex+fHWqdq6I9mRIgtCcz0b0C5tZOHO0rsJmC0v4g2RF7lso+/LBarejKu1/kF8ruGwTy7+3GrnHF9bqZD0iNOfLbyyMxaPTFsmaE9tG+j3enzh3E7drm2Sdi69Cg9+7aoOnbWQNz1ehuJKFtchSR3EW6bcx4lyV7P9HPHGvrdQv+ISI9+TZA9Rqz/WrTKH2rtq9uhtYh0+V6NOcQtrp28eF5nxDrmBhVXdbJM9LgHXiSnsF/baokeN8GJ4LLKscFaleTxdt7qZ1zHlmBepVtZBm+/mU0JzvRvR9wyfAwlhgY7BwrgD9yWBJff4XS1lSjqqE5NP6Dl/LMr7+RYN3u2k3A1KE5vwwouffzPLPtszCwlmMbgNdJUu+A/41xuVNylLRwc5ai4TV7Oyr0uRg56YtczmH81am6tvbKRsGW+lgYSxm1tkZXRX0hoMFjfD1y2Q1SC1FTwLzaifrr2Nva5QkdUtBLdzmkvAvK9PVDT7Sj8DCWHBWBayfd7qjjiNZqH+YWeUXl6AyHnm1jTk2sdRGxSjgRwHNOfKy0C9r08JenVBf0sV7QmqEmYXzIRXWFpcs7OfAv8AaXroY/QjJqzVvFMGK5i5CXwsW1M63vSJ81dqEfA5xA1iI/cws5CBCHyVrfu9NcuxgdY4rTG++OGnja+5kp8e60YBKBbW9Da7iTJlpYEw3ZdntvJKFupSZJfJa9KNJFs49mFkZo9zo3Qcnzbv0bvaBFaBxngU1+5HXhN9nMSGf8l7nIlnoZTKzuPdA9CRJFs4wmFmjlQI0yDqvNqD+HlapvitdcSqoHSx4XeiqjallSm/0WkgW9jrMLOQzIvaSrFstwy32qr7NhQp/ctJax8WwtSnOVI0X0Iq1uSHWkI0J53l2tHeTrPvdNltYOT2Hon9Osqo322aZR+vazuSRJ6+W22cvq6rkpZWrC2hRG27h3JypTLEB6JmRLIwFZ2PBQm4kcg65HnE+Ktf2CMmqONWJjkU7afP67Wf7FuWh0Vfya1/m3BLrMasJ53MWjywmWViLeAZZxxS5kYhXpBbifBLOp4HVNsKRjCudtGYlDrLhCblpXMf8Wo9Ft4Te25pgl8RTJSQLz4R1B5bMp8a769jLAgtn8MDqkTs3XWznpG27Hsc2XchJDfLn1y4fvSnWtq0JdsHcg2VyjlCCG0ZIFuJdnNPBniRYIp+TrJQNOel5AydtbWWVxS5xoCfXXbVZD67jbKCp0ulh6AWULNikzc1M1vWRvkpUKU8de8tg4TwdWLf9c1BrMcYf9XTmfiobfdRdNY/kq0In7EzIW0TOI1ng4HwcWIEDJqBXXsc7BWfDCvTfKVkv3B1o7vK8WuTuROY/3ZaW3nDRHjdKFe+hbCbEuwldq8jvLMudaRewYg5PQn1HRx8GWA+/ZrL859nTkYLO2srDSexAaRta09xFG9LtktAce1P8rbGoLepiTUqWwXaHZJ1vN0XZsbeRjJnwrH7ld0lWrrV2VKmqs0bjjrJ3Xazp61Khi2Mv4vyjCTEqbCzWpGTBLmBNajYV9R39/dL80h/Olt4tWdfGZKXdz/Nq5ycksc/dfrDJB521wefOC83JbkKM6jHbU3+Y7CpZ3VbslCzEdSJu0dEbg3HjHClYFYZmoRw+ebV9lxLZ7L++sbFTnbV62nmhOdlNiLdhY8TLGEv04qh/5bXTlQrfveXnOMeI861g3WhvRXvXO2m+Xw6zPY8+Mxstr5ay/JzQHAdT54NT0CuvCz1WnmbfrmSdv0uyECOKd6dkbTi5U54HBut+6ndWeoiTdjw8kX3q9oltOOqkld51Fmc8TYjdRcyqIy/C2cfV8bsz65gidsZ5OtTu3ydFKV9G75WsQN+vrFJuJ+1priPsxaIP7OPdPJrDgjNCc3KYcObRr3MDycJZUYzFzBJxi2Th/DDOT4PV6EwGS5icR7sbc4Q9rf6e5b/sqO1vdEZoTiZL5AWSBR9aERVjYYn3sGSVKh4tz5uDFR75iembHLX8u46w4qlv2YeU3FpB2zNCc3KakFPgbCJYOKeLM9dmlojndPRx/Zy+R95xAVbHyA/MlMtRi86dxPJnT2fLh+fS7n85jXOsJsyXe8HGkgUfcvDal/muHeyPs3fy83ZTYpR0n0OSNfjKO3aidG7N7c4RlvrxFYtqklPL531aaE4uE87i1r+fyRrYNlreKQAWcg2ci0TfG+aQv8xk1cz+lh1jubQ5sYLl+ZLVnZFDW/8uWWhOJqvvuKY6+hFhd9ybAFZ0jQBFxAE6+jrH5tqr+LipkuX51xtmcyaHFlE6kUWUfc4WdnTQnFafFpqTW7IWn22uo+cy2TVG3tcBFmL9Oy266dhrwBxWn8wlq3/5V2xXQwcto0sC682esO/T7DV7McbXrzJZF9611JErYyywC1h+JwOU8NSe8nPMYa7rmmR1rfuSzTxpr3kn6azAhwes4wk7LVfH00JzHE2YL9gYOQz8cU5QfGato0qgMq1cP/k57sp4WjdBsi53e8byTcimPfqsM5p6jz2KsdVmb0oRmpPHVO6MvyLiE5lbuWXdr/R/oFpYt24P0rEHElXqkOI/8HDmO63QY9bJaKf5vktg90bfYUdzZ9WGjzkjNCePyWxjfAd3TJjqaxYWzt2ijmldLF7Z8DlRstxmP2AvCtlqlXImsqigW0wLzKKFRKXgPLIJZ7NFfCS/g7EU3qxbWDZFR8t81+lpvPL+/ZHM3oKWd5nNcBvt2f3DrOvUG2zePSstssZpoTmZrNTqfWTdZnB6nJKR5bCFNWbteFlLuzVNVc62PypZRUrcZj1jrLUB4w+zKanX2INCP7nz82ShOXklKypogI7+xkmHDikLqyVaWEKnddTv4Q8DA49J1oBxN5lLDyvtfovDrHfAVTbr0zfOh6YIzclrgh+Jd6SOvYiUffFKuR5HLCzr3VN19Ped3KYpP3cfz7T9yuvs25tvfEfRBNbwaCp7XPELf7XhNM5cS5Z4R8v6RIk9qmKjJWXWc3oFivxtuv56fzXpW7PynZCs50WvsdFrvvBzlQ6zPqsvM7XIZ15oQrLQnEyWeBfpOEPhu5Mrq18clSycMRe+p6MW8iuLJ1xh/UdncPfcicxu+kWW/iWDfyl+SmhOPsn6Yj1Bx/mZ73k0aZd/7QVIFj5fSrriOOmEPM93ZHsqm3zgI682/zDLVuU8ezYpg99edUJoTj4T1grOtaOeE+yriXdiJgs5rtAdHft8W7IlKO12nFCofRDtz3OZRRz7wCtWOMwmjz/D9KEf+Z4HR3Gu3IQcG+fK8R2MZULz45l7rG2DUePQcQ4JfrLi1gnFzyuYrny/wM5EfeAfXyew+FrJzMrrPb8ddURojoupdEKQ0vT1ZB17eVdH6XK+sL+9osVMRcylPu1Ebbl+zKxhylnhq+/5zkUaKzDkBLNd9I7rHxKF5riaMJbBAX46zlRVGpagJDc6IVl9H85UhM107LHanz4sx1ik6kxabXeatWj1lqedUNn1jcdYvQ9v+Qj9iNAcV1N82gzpR9gv3nsO99aclCzk8bNmBOvYLyywLFHZFn5SsoLrn2KBn97wglXj2fOpSWzwjTd8Unwizs6bYBfMF76DsYCFPhiwtrnOkrW/hxWPKHTplGT1WHiCjYp9zSvXiWcrAo6w9kVe8+ixiUJzCpgcnwUrYi5l7dH7x2HpR2ZW0PjZOupQWAuLzyZLludfx9ir72l8XM9DbN6kRJbcNI039U0QmlPAhPsY1nQN0rH/iLFUyXFKssZGzUJdQJ49/ZXV5HIS85z1ko+seoiN+pzAqtR/ye9U04XmFDRhvibEz9DRR9jteKLyZWMm68CdWUriqhB5HhmsHgNOS1bo3CPsVP4X/GTKQVbtvM4Umxc8qTXH/QAm3MkgeDr6+MAyPxfufRiyaJ6OPpjoxCMi5slk5Xx7mLk+f8bbmw6wtAucRTg+49/6xAvNcTMJ+yriGXTs8YEFG5tZuGMD9Tno4MclKZJVYmwCO/3wKW/E97G4IyrLWvYJ7/gsTmiOmwl3YfRInSPPP0KHU61PW1jLbi+W5279Oicp0zIyWQHRGtvd+wlvmm8vu22IZ6v7PeRq2wNCcwpJll1KiC7iNmmXx6cyWajtFPBYLs9PQ4fMrOfEWdtzD3n6xj0sf9uDLKDxfb4nbS/uQJAs3IuBegDGAruAhXtN7vAwedfAr6yqc+LZ+6P3eLF6u9nBlP1ssMs93jwqVmhOYRPm3td7kY68u85fSYpbzUyWGDfq3PK8ufOso4pd9zOSVTomjg1qdIcvC9nJQo7vZRkvbvPz02OE5hQ2wS6jaKm8GwJ22bQyk4Wa07Gr63TcP1Cq9TELq7HvATZ46S3+tcd2NoLHsBoxN/mYfdFCc4qYYJf3S1foE6Z0Vxq/SRJxZYpkoRaHO1T2r+8lNc3MavNuL4svfJO/949kzsujWa2TN7hjh92458GEWuDAkqt05P0d445aWKjFVVi7QUfei+cy+4T11hi2o+p1btsrgjX+tIs9iLjJ8/rtEppT1AS7tGu+RhfvSKn1ZtauI/OQf8vP8Ruwo5zHJ3vYnOXXePm2ESxbk50sJvY2L1Z6l9CcoqYR6+eilqDjjgewzPOIO2tSN663sOB3YLXrF83q3bjGx1aNYO/itrOSD27zpOxRQnOKmYRvYa9M/3gkk2X2r4bp89HjIVmYR7DUkrOoTftd7Nmm67xm6Qg2yH07Ozj1Dh/7fifusjCV7TkP/RcWFuwCltPsBZLVY3kfOSfQie6us8kqfgdr/PEGbzMmgs3dFMne3brLo17vFJpT3CT89G+sJ1ZzqH/QQtxvJe83gQ/vH3lKYelzaajDdhYeeVOy6oyKYK933OeDlu0QmlPib6wRVTNZuEdpxdQ10o5YW8+vnpR9ona221n+9Td53PAItsp5GzvX6AHf6RApNKeEyVqfL+0lYkDJgl3Q9/g9ehHu/ZLPBY0Ga+rVUDpeIJKVH3CTN5y9jWmTw1muIw/42SERuK/DhDt4+ub7Nwuac21iCJkeLMLeh2RBP/Du4Pp8KvPXNuY3/yavOCicLaobzvYVfMif2EcIzSlpgl3gX2YWbPyfLOiamZW+bSubduomH997KxswNJzlmfmQz66Nu2VKmeT9UntXW1iBdsmyTxQsrAfY61KfTFa32AX0s8gWVvXlTX48ZAuLGBPOri57yCevDheak8mCXcCCT4J1pu08yUqouFKy8K4Fi81fTL4NtrBzdIv7jN3CJi8MZ7tSH/IWnbfgThIT7nfCWFAjgk79ytoQtlyOEe9N+VytV9DVfVtZ4bW3+eCaW1jkvnCRJz/iJvvNQnNKS3tB88CC5oxhpyxjNFxeKtc2YpNi9U4q3dPW0UNh84Tet3nk+k3Mzmkb25L2iMeHbBKaU0ayMBawhi08It9D+7cskj4BvUcfBvIExBk4cz0mJZxVrHWHvyu6ke1/v43Zv3vMZ03dKDSnjBwj7lQCC34EFs7hgyX+m9QixHLuBY8ra3YcoMrlw1n1xXf4qdD1LHlXBCsW9JTnmr8B965Iln+2ZZKF9zb8C2fUMcawlwt01AAR+0IPcea6vU84e/rmDv++di1zzx/JZrd8zhd4bxSaU9aEGvS1PEskKyksMzYp+Xa7ZIn1LfXWHC9ijN97hjOHh3f5pbDVrM2xSNYy+QXvWmGz0Jy/JEuMR7Jg4/r3j8uz4GYW7htqnVNXXj8+pqjuUbRvbjgrwe7x2wVWsU4dItnQq8/5D2Wz0JxykhW5b6FkjVqXoMRP/TdLzIuOmilYd4ockz3zs8PFuplwj1/IEsYm745k6ooX/JlhK+6WkSx85z9ZwS6L5W/gTh+wsCZwPwCtDGelO9/jYepKViMgkvUt9pJ/yR8uNKf831jmMYKFeTQ/F9YEWDZrw1mLfvd474SVbNyASNbs4Qs+PmWr0Jz/zhL/Tdoe8TVyq29Tt/3Gqtcxkm06/ILXLog7gir8jYWYvGz77b+x4BPQ6e5zw+nOsnA2v909vu/QSpYrOJLZlX7Juxq34v6c31jwb8xXlQKRkoX5NbP0kCR5N8OeDOFfZe7zPDZhbOWWSFZ74Et+r1C40JyKf2NhvsysXJMXW1jQ6cKbt1Dv1+FshuN9PuLrSpb9eCS7svMlX1B3m9Ccv7NgY9yBABbWI/wLvgptNZzYSMefC3tlvc/XflrJIqpuZzUWpPF+oRFCcyr9jQW7UJZwySpSf4mcR7Cwvm4GLKFd98LZhbR7/OvrlexA/+0sn80rnic2EncESRbm3syC7rScu1myevsukf6F/A3x+trvc2jop3B2ueB9XmtCGOuevp0tqfaa73y2XWhOZcnCfJlZiHN9E9ZYWLhnKa0xl+sLOd/bH+HM66/7/OOBMGbvupMNj0znHt2jhOb8nQUb77q72MLS47soYd6qzLtwF8+iL+EsvdB9nn9vGPtWLIrlffCO17mIOKfKbyzUE2CXu4a5FnshxkMeDg3zcu5Ij0K3sZetH/CcJVax1y+i2K11H3iRRtG4B+k3Fube4HFYKdjdX2ohtKjc/M6ybgKbod/34/QIltb6Ea97bRXb1CCaBWgZfL1zjNCcqr+x4m5zOc4tX4YRNBL+BRbuXpV1poSmFFpfxCMvH/M9o1az5adi2dc+3/iwtrFCc6r9xkIdAHZJ7dBPsjC/2Asz13n8vCtS4EjhU4Of8ZK91rDms/exe9mttPo9Y4XmVJMabWah9gZNcJzQhYQ+Yw9RsraNj5V1GL/dpejy0p3slVMa339jLfuyJ455pFlr1/vG4q4nk/n3wUJ9EX45rmpTGReKOFPHvtbr/dHyd9TlZaiS2y5Wqvkbfv/ZOpbsobNhhbJqJ67sFZqTycI7AqyY6gekL119UlvuHeOeQP8VHWWNHPZX3StThW+72boG73n+ZutZ+6JH2Wp7Oy1I5AwlS9aQ70cRT0pWYOpeabM095oyJsfder1sO8gabhk9TvF7VoNqX41hqYMz+I3761nJi8ls37JsWv5GyK1qmBBLYixgofYJu4CFHGKxMkdH/yLq1JI105PyX9zP/F5+5W6VNrAClS6xoGB7bZ8r+gHcTYi9L/QNlSzUdxu2yWSJvF0R+Y2OfVvsqWCMBoORSvdSWd/1P/in0hvYseE3WXrZ7JpzT1VojrsJe9piPJKFuq/H7EOShRrIjekzdeybYi8NtTm/UvWox+dEdqyoldb4yXp2bs9D9rVEds22HXoLappwLyPGAhb2FFBPezzSg1Bb/lksWN4Bhb1l6ROCtejtSdZim5W28PM65hucxka9tNfavdKE5tSU+TbyWrm2hV3Awv1fmzIm4j5DHXv86AXA/ILVM/ocm3bJSnvos44VXfWBHRxmr70M1XFnl+nuvCA5FrkeJ0TI2tyR1V6EXjTUc3D3Fvbisb7ASo26wkIjrLTXQWtZk/o/2JjD2bQd7ROE5niYUMNGHQA5AfbSoAlgoQcz/ZGfjvNWOOuOda86NCD10R1WfqqV1i18HevCbOjsxGza3IWHhebUMqEn51xSoMwTwwqHyzpj/BUDoTczcMAEHb0tOM8FPQLLqdIzFpFmpe2etIm5xGWj7M3stHtXDwvNqWVCP9bD1f5S83AfHOwS1Uqh8NSe6LmTd3ahpwJ1I7Aez3zLZlSx1jo938pGD8hJodVttVi3I7iXzISeQtSZcLcc7kqDTm0NMRK05kHISFkDQU8FdO1rekNaVuQrG+dnrc3sFskq1cxDnXxsNOdWR4Tm1DHduj1I1vjgk7AxdAIs7KGDVWmYUd4/hdgMrMrR1tT5p5VWZ9Z21mKDM9Xqbq1VH58kNKeOCTZ3nzRWR38J7qODFoKF/oV37UfpOCuCvXIzq06MLe0M/8lDnuxgz8vlp6BnP3iZgseF5tQ14Z3l/GS0jvvgsI+NGhhYqL10+2ukjj4wnPlAjA/Wua7ZKUv9b7zwzp3MtMSNYtUvvMCck7h7Te7hhwSO1tGTgX1k83Ohh9u7xwgdPeZgoR4Mlm/PXFQnIYMPrLabvVhahBYO+Mi77jolNMfThP4JjAX9Q2BhvsDC84BlvucJLMyjXT4nSin+gXc8vYcVDy1Oyevf8qtPTgvN8TTBFzEW/H+wzGNE/1zS5+Gy9mdmwe+Lb8xHmx3Sue3JWLaySClyOvKKt/HFvpWXCbUq4RfyPkD0wOD9DBb6+AzLhsv7v9DLZGbFjc9PXS6/5G9oL9u1sAyt2fKcd3iDfSsvE84h/8qCH4GF/kKxjmR9E+c0EE9Av05sLEg7Y57yQ6a97OTAchQ24jGPjz8nNMdgwtkZjMV8F6CZhV5T7CvgLjGwzPb6FFWIAqwe8RfbY9kgz4r0fPQ9frbFBaE5BhPquvj9/2Sh3xEs1HBxRgf5KOZx/cwiZHpzlze7GcOqvq1MOrvJP9S7KDSHmVBTx3fAwnlY+BFYY28VQY+zrCGjXwosPNd05+J0ze0mX7w3hjk/q0Zjd6TyhVaXcIeeCfsJZhb6N5DDgoVewMI2w/TU8x7yjA5iKbAqnypJT6Ze4VkqxbJmu9xpQNI5TvMuCc0hE3ruzCysYawVsHC/wNJ1Q3Wc08C5FtTGYHuPuDK04/Z5vmthLAueUYuKKKe4R57LQnPIhH5L/L6ZZX4u7J2DhTu2cKc34kWwBtQpR6OWJPNlyTGsadO6tHzpEe5ojb1yxYRe3F9ZsAtYOHv/T6wxMRXopuEoL3M+hh1z9KLYahrPI1hWVkYT9rV/ZSEfBQvndsFCXR991sh5wRqUUonCVup8f2oMS6vPKLleHD9U+orQHKMJ9xv8EwtnWsHCHgWey8yK3F2FNhgP8QOC9aaBQod9Y/nllteE5phMxyPs/5GFM7VgYe/EPI9YQ1VmVKM9l/fyg4K14o2R+jSP4p9LXReaYzKhp/mfWGWKPSZ8jrM78FXzcx1vVoM6d9rN4wTraJ16ZNN5G59d/AbuQjSh7wzfwbnjX1kdn91Az4luvuMK8wvWXzlrUlq/7XzSpFh2MGcDatlmIw+hW0Jz6plwfhNjQT0cLMTkYA0ucU7+hrzH7V9a+K090RPv2tTj4lZuf+EgK7O7IdVOC+PM5rbQnPqmhnueSBb6aH99rpCSRyULe2NmXwGrZ4AnXci+kV9YqTFnu8b09sFifnjVbaE59U2zGtyWLOwF/MoSMRLe3XJvDmsLcT9Yu1wZ1dm2hruVOML8fZrQ59QQ7uN4F/c9mubEnpcs7Gv8OsY7absJWph5f80m+VzS748pVOvrMp6n/zE2w7UpLf88g89dc09oTgOTyNUlC+cJf2WJmEuysPbRP2lm1VhgomNlF/KascdZ06dNKWXGVJ608L7QnIYmEYtIFu6/QC8o8kT5TgtcLVm43wR9VhgjWFqV+hSSfQ6fuegki3FoTqebjeTLkx4IzWlocmwaI1nQYrw7zCyfQwskC/uluJ/d/FyO/RrQt4ZB3PZOMjt5qjnFze7J+018iDstTb22RkoW9rrw3jazcObHzELMgjkBq/kZoWFZp/BiC5NZ0y3e9C2jFR/5+YHQnEYmsW4lC1qMsZjnUbwzCe9HsBBjwo5gXb/ZkDY6DuNVF59myWta0LnFRu618qHQnMZCJxZbWIglUZcFq8DRThYW7g82a47RvxFF8u48/Ukyi53RkrRS1XmBAQ+F5jQxidjbwoJdsO6kRnduIFnYkwYL9T+wco9pTG03ePOag5PZxAKtKH9YKZ5Q4AHu7TSJGMfCQv+XRb+6VpEszCNYYh1IlqlTE2qxhfGSfyWzm2da0Ts3Fz7b977QnKbo4/uNBW0BC2cGwcL5jl9ZKVOb0vUblXnhaslMqdOa7k3NxuuUvCc0p6lJxKO/scz2wvlWsOCrYKHuLnWiQzOKel2cF3JPZn2Pt6atN9LVZtPvCs1pZsJ5vn9i4f4JsHDmB5+jNgSW7Y9m9O6NCy8sWM9OtCFj52tqwZV3cTepCedC/4mFO28QG4CFOcEYsba/hzUn7ycOvIhg7RnTliIGJ6hVBt0VmtPchHPHv7JQNwHrYfJy+VxY2/gcYwTrXTdvmr37s+pcL5n17tWWBmeEq98b3xGa09yEeyb+ieUzeRBD7Iv78OSd1sK/1OEGOvvDm3J1uaXmE6z+zu3oeq6Far+5d4TmeJtw78uvLLyfwcLfagALWoi/eSLfHSJ/XDyxBd16mKgWrZXM1ni0o5vPfNUxI27j/lUT7vL/J5Z4XgNYiMPAwudgTX/Zgt4MjVCLCdYFYzuqUKO9+vkUegJbmNrm8P1HFv5OxZS4UbLnAOtUrsf+5amXqSUVzVikFhes1i7tqGLt+uol71tCc1og/vpH1vl2UyQLPQdm/UJNwUasQbccU9QSgvV0e1tyzlJFvWu6ITSnpQl/9+E/feLOjlq488YLcT/e22DhnQZWny0tabFvH7W08In2tm3JU8+ntqt9DXfMmvD3Q35lYW3nsa8CVvz1kb4y/oJGI8YDyydOsN60UMtXTmbjT7ehiOWP42uWviY0p5VJvCMMeHeZWbBLgdOVMEYVPQeIzfH3ZrAfANazcy1p+xymuixLZtt6tiG7qL3xr7ZeE5rT2iT/3onwb3zHvLbBEvOodj44RUdsbM4hvt8tRnOUllRDLa46+p5igZ3aUJnm7eKdyl4TmtPahL/pAhvjzIhZc8q2rwD/4sgF8a5DTGxmHWrfgh65ZFVPJp9gxZ3bkP2xtYfWV7qCe3RNGMuOfGNlDoW+dNjFa0NZEU905eg5wDsY7ycz62LJFsTP74/PM+wEi0luTSv92ntuXndZaE4brCE1OXyc/A58EnlHs3KlaZvrLB52c5rMH/HeNLOyjGhBrc50ic926gRruLc11V1a1+tL20tCc9rCXhw9Pchf0aMLG4Ml8k+OPhjcW4BcFPmb2s2VWjm1oBjTkkOGMcdZw42tSc+/3qu2clFoTlvkadwheYLMq/FOQ24FlsjVJQu5n5mFu+F3v/Mmw4DndQoUOsbu1G1NQ7One0U9OY+7grGGuNvSibIfwMzym1FI3tVRwNZfx90MYCEfAevjDm96VP6sZ8P1R9nzZa0oKb6wYWSJc0Jz2plKvQmTLNzFAxZyqLClrvJOjHJn/OUd7MjTMHaw/Lp60/T7QV5W/USOXagVXfluMPx4liI0p71pXZc4Lv9WxIuG0ifBCi+cT94/8L5fgIw9kSvA9izdgdyvN6fwERe96o1MZDf9W1HQ0Q6GF21ThOa0N2Esh+dO/i3nwz3zQm8lC/ku+szNrEb+zaljtIvBcUgC0/xa0dkDIw0uq07hPmQTxoJ+KnmfwtkN0l7qoDw4zydZqA3hrLu0o5ctuW9vTvWH1jKULK2z7xVb0WSnmYbJpY8JzfEx4X4PsHDGBnEpvnPqTS4SeZKGPhTczY6zO/ic2tvQ3eXNaeuCZoall1U24G5LCui33DDPGf05HUQMYCtZqE8gt8N3nlhlpw0nK2n5PgXqOLeAHn/YHizybk4Jedsa9vU9yDZfb0kOpzYYnrXQheZ0MG3d5ixZqAviLAFs/yopG/7ugPa6wwxZJ8fZA6wtsKL2NaNSFX0N97rGMuv2rSjfwW2GS74cdz6bcL8HWKijwi6/suLTZsj9NPxNHfNzbSzUjB7ZzDQsTo1iFW+2oleTIwwu8w8JzemEXFTDGsb+Ac5HYR6/e9virgHJwl7m1m1LLKzSN5rS+/crDOzldnYum/D7S9sNL4vvF5rTyQS7wL+xN4hz1bBXVqesklW/bXDm3ySYtkiy4BPnhzUjz+OrDGUXRbIfd1vTwGw7DX8loYbcWbKiawRk7mVWW2Fh4R6JdoVm6qhDoTaN5wXLOaoZnSu62lDjZTgrE96GbOvtNgwPiMW91iJeLa8lfA3Q8fc+cFYksyfQlsT7SbLQu479dDPr87TmNLvESkPudVtYl0ttaE34HkPYz2ihOV2kvZr0CtTxd0h6+y6Rtv8w207eR4KapIh/URe2sF4xb5pbZrXh+cTNLOxBG9p9J9bwOO9uoTldoF/Sj9Dvjn0JM2tdl7oa/j4Lzm7jb9pgf0wtmY3OPBSa47XJcKLQZsb6tqW5SfsNiW92Cc3pinetdndekI5+d9TMYa//j7K3Dstq29r/KQlbsbtbsTDXGLhU7MDuwu5uVEApFWwxETswkVCR5xFEQkIMRESw0W1ueysq33nP5yzE/fqe9/f741zXuZ598XHNuea814wxxp2Xhdh1xFhgPuI9fs3fk7NijinOEXvp+IC+/D4wRLnjfRy1u1X8DeLP8Dc459ZYqMkqfWMWz7ULvL46l7VjYU8u6HNKadbHn4rN68ufzM4rr+cdE5ozXLIwvvE3OP/XWOL7o8PZNmLX91n+YpUN7clmL08ppgX30NcKfdn06AXl0lr46QzHGlPXzGuVHnkAiPHIy4o54qnHWTLibqDRYCXa9uKXI0Ubd+8mx7p9OSn8gqI0PSQ0Z4SKMYlzX8S7o4/zsgRD3/XtEsSnyRhDsN7cEt8h/WHFy2EHrfzRh5OXX1COOcKHZYSKeYfzcJz/Ru5Y8xvr9mwvPeLNwZIxujO+0N/Pe3Kl6IPK7eHbqHvrPtxs8HllVBQ8SkZKVnyIm/5hBSec4//W9/WmG7yMRFsN93a+D6jvt568KPOgci7Al06VduBzq4OV43rkghtYiEtDXDneF1hlRxjJser3ba0esacaC54uN8W3tlj5g8rk2C20JaEXX5hxStn5ZKfQnFGShdg/nJcj7gcs3zlvZT1e3EvC90nrL7BmbuzBg7P2K5U+bKShdXtxrVUnFWuLXajBLlkF0j31iFeFjxRYEflRM721DndziBnE3QPGPVgBTt253Zh9yseq60lt25PftDylpIbtFJpjYCFeD/GPeVmYD4ifQDwd4srAyvZJpEc/u/Kcbv7KMHNvcqjTgy1XHVUSsrcLzRkjWe8/eUuPJY31tV6mrB/cw2+LHrGBYGGsLr0UR5/qdOUrlfYoKyPX0A9dd46/f0hJTYJ/h4GFeyv8jcaqcfm2rDl8y2Sr9IQCC/2F55of1YW/b/BTJpxZQ2Gru3PmmgPK3KbbUGdesoRu6vGuNBa8ZvC7xsIckqz6KZS4qwvPHOqnlKm/lgZ+7sY2J/cqvYb6Cs0xsHDPiHnybxbiPfAO8X619+gkWD+H+Cl9EtfSx1ndeNAHf8Vqtq/QnLGShXvsP7G6rN8mf2/TYo1kfR//hJTILnzfx0+5ssOb+j/vyh+a+Su1asGjxMD6K23TH1liDSQ9zzBPwfpm8orUyl25XrE9ypTd62j8ji5cf7Sf8nMb/DvGSRa8zRDrprFKt02TtZvFt1+PvkKOJd4jnmt/VhdOj/BT2hxbR54FO3M9mx2K04YtQnMMLMT0oE9wtwaW1dl0wvcpPmunHvMK3w6wMB+zDnXmL8a7lX8G+VDce3u+dWazcvPQJqE54yWrVYyv/BtNczQW4ujARyyW9lwTjnVi1X+n4jHZhxp+6cjPh25ShvbZJDTHwBLfWD00fcoG71wWvnX5C+yRvyPmCeMeHkvPGthzmtd25XP2GjqyowMv9PVWWqRuhF+AZCGeCs+kaTRYqCkt1vV65Lb2Ob5RstD3UzI7cPdgX6UnrSavKu054JSXEn4cXn8GFuKscD+LtuRl+dXbr8e3cRZvlt9gaOGyq+35StOtSvevXnR3TDseN8xDqZq2TmjORMlCv+BvcNetsbCW8+p3UI/cVvjagZWtZNMyR5UXt9msfGrqRY4dmOtddVZ2d1krNGeSZCH2D+9KjH/JerXvAa08VEl3IPWoHn2Fui7oe7Cik+1Yb7FR8Qv2IOOaCnOf6Yp6azU8ESSrzYS9+qp91tuJMStZga4vJGvN+5N6oWGylgJ0FSzTcOI7ldYpabVXkYvahtfsnqQ06rVaaM5kyVq8+oA+rvNGOzGXJevAt1eS9fLIWb3QHbnG09rolt2Gt7Zfo9QZ7Ux7CrbiHIuxSt9tHkJzJss1U9zCI3r0L9qiaTTWi8tjQ/WoD4O6VFhngNX0WSu+9dRV6T/WiZLSbDnmxRDF8rmr0JwpKmqQ+8cd1+OZUMshLwu+lKgxgPNo/A6WpV1L1r2do1ivXELXk5tzw3mDlLWuLvB9UFFHLKznGb3QBFkvIi9L7K+kZ6J2lwnWmCK2THsclcPH5tLKbc3YbVF/pVkLZ6E5U1XU1M7fNliPNTz2FzLWXrBQZ9z/a6Qe9wDYu2vP1di+GZfyHKqM/jmN7s1pwnXtuyhm1ouE5kyVzyX2RPrKj3bJPFasvcHCWh1epVjzayyM1R8vmvBWj6HK1pmTaWZYY973Vyul1LFZQnOmSdbRkuF63B1g/yrzCQQL9djAAh/7N9z9gjU/szEfeTlIOdN2EjW+0phf9GyqDAycCW8LnH/p4OOJfZ12NwdWVpv8uc+Fu1fEeyy5/pZCKjXmKpOHKF0vTqDm3o15Zrsayu03M4XmTMedjk48vx73gtrZAVio0ayxsA/Hc0EnNn2zYfsXvZT+JSbQzC82HGpbQeFBM4TmTFdRoxDPBRb2j/9moY04dx2dopdaaK3a8Cw7RdlvO5bqTrER68LySq+PU4XmzFBRN1zMD+kHi737n1g4a5BjQnwf65dpxMuS6yj3bo2gVYoNl9haTqntPBX+HSrqMKKNYKEtWHvnZeEORmM5VY+kvywb8ZAPVZVaSSPJ2t2G2zctr3xrOENozkzJEvNDsnCWh/GVWe5xLgv747ysKpMb8aHIasq9So509JgNv1lRXmnrNlNozizJKrPF4HmLfsF7xDcNdajBwlwEC7+DlbGgEff4q5rycu5Y2iL6Pt+Cykr+rnOE5syS/bW+8S8WtNhh2LXcMYG5ABba7vRXIHm1asThJeoqFas60iTHxtziQnVlw+AF8CjBWZpOtCuXBZ2aNvVqLgs1JHC+Klk9AuhwQkO+t7y+8mL1KPrboTHbba6uvK+5UGjObBW13P/Ngqce2g4W5hbOn+T5l2BNjG3In2IbSdauMY3Zo3RtZUffxUJz5kgWfHXzsu4HhOSyUMsoL6vIw4bsb2yjPG8wmmYdacy2Z2srjc2chOYYWGI+/8bKDjsj69WDhfohedt45GtDrtXGRil0bTTtLNOE5y+3UTYoK+DD8sfnAkub28jNx+8aK+9zdbBsym8sbJVxD12F5sz9rb/wvjQWfsdYwXcD4w5j4nu5U1R5Y0Nu3qOREmw+igJeNeVKnm0Uo6fuQnPm/VcWnhd6C52Q64nQkN9Y0cOb8+jHpLjGrhGa84uFuZ2XBS10m6/TizVQrn44uV+g95kN+fL3Rsqck2No4HFbbju9o1LqnQ+8ZnJZ0K+8LOjHo7Xn9Q0KbpZxCvK5+uuofr5GvL2/jXLcZCx9TGjJNT0dlAvTNwrNMbBEX0hW3r7H2VDl4mf12OtivGqsTfkbscUYG+Vte0c6N7gNX2w1VGm7bovQnAWSpXbQyTmsxZuAhW9H1OQA/aMG3vIMRGP1LWfDG683UYzejaPxlYkbbh+nxHXeJjRngZxD3Uadk98hfLs0FrwVhJ7psX/B91b+/u4KzbZrwrsGNFP8Ds2g6e3b8QSzWcr1bdhbLZQstAXnP9BjjYVvCmLpxT5V1uLT9jA7bzRj48atlZUfF9OSoR34mddKJbj6HqE5iyTr9MYTepzZoM4TWK+bBUlPEcRgY/8G32S5nhCsWmktOLBoO+W61Upy39KJ32z1Vop22Sc0Z5E8szr69JBcZ7113/GfeJNLcr0q1on6eiMWS99kzEewThdtw5u39VKSb3pSVlBXrhW9XZnmfkBozmIV/YKcEOxpMS4N8SaX5N4Ke0GcDyA+D9/gpSOuU+wPhW+/m6jseraWmpTqyU0uHFEqlD4EzyDEPOjWRm6TezuMS0N8ziXCfhvnFjgDQa4F7jLBapVuxyzWOc2frSOfzN4c3ypUMS92SGjOEnmeA79f5PXBZxt9vM30MqHGKHLgcDaDtTTuLrC3qh/RnqPH+SghTTfQ38v78oOcGKWsG+KQl8i1nE+TtXrkMmONiVgMsODXg/O6CqbTEE8nc3XAOtvXnruEbFeez9lAJ3b25zdvM5UG0QeE5ixVsd+H3zDy7jMqrZd3JEs/xEh/JcSSgYWYOsTyg3VgS2cu+vCI0vbiOrJKH8hDL3xWnGYfgC8S7vl0iEtDnSfsFXBnCb2HhxTinMBCvidyRcAaHt6VPewvKPZ3vCn4+2B2HGhOI/KjxpmTirbgnB7nI3iXiI8Ga6PNIh3yW8FCznL+qfGSNeF2d67ZLFmpHLqWej0ZyjsKFqGMBD+hOU6o/aHD2TbGUXYxT5lLAFaZfM66kgPHS49c/DvIwwJr8fxeXHXKY6XkoLXke2s470wqRad77xKas0xFrVzcA+EMCGcByL8EC/5Z8O5FfUbUJUP+Dva1R7Y5cIb6Wbl3zosiAkdy3XkVqT7vhPcT7mt1uB/C2RDOSJDbAxbq3nauMkyeI2K8dluXZPc99h5Zb+7L5l6m1HmrB50YMpp9squT04kdQnOW4+5EV7PyBD3qTaBWQa/d8XYjHyeINYCnTp3bX496ljhnK1XrmmQFFevPTm75qcxSN/IzdeRak+vSItMdQnOWI39btsXx1nw71ENAjlT7m9clC3ULkN+B2h0aq9SHATz6WVGKrb+KimaO5VKz6pPZzu1Cc1aoYp7oWg4aKucd+ixwTKJkoSYrcv0Rm46aIkMGX5NruWGOg3jb61J0rPRKOvRkPJd42ojsBsOv3Bl35bqj9v3keSXO89DHGgvewYgdxhkrWNjX/tw8hPXe5aldnZXUdfAkDvVtQlkftonx5Yw4UR3qTGAcoUZGZL2kXBb8dhHDiLqdYGHtq3cbxgfiK1HGMVcy2jeFW1doTrbjUNPSwBJjX54Vo+4dcu1wDgBW5eLN9IhZxPkyWFiTb3cewR1fVaGI7S5UK24aBy5pQeM/4hzA0MbNbKfffWG87BewsH8ECzVc4NMKn1ywcFZ7JnIUW9SuRv39nels7Az2PdGKcmgzPLxUoec6nw2tZMwpzpHBwp4PrLR2dWUMY6U5o+xqvr0m73TaWTpymZHVKdhyBZ3xnMWXdrahzGGbxbh3kW30eNJEnrmjX/Due1/NliyvfjVlLKxHx5F2k6smS5bfybG8Z31tum+2hCaVmsM3+yhUat1moasuauh9D3gPyRwH1PK58SFJnpOD1WZCVT1q1mNcaKyGg8dzhev1aZ3xItJNmsuVo4kKm24Wc8hFlePbuo6810BuFdqIOwqwUAcJcZnIzXznZmA9SZvAQwIb0W7zhfT0yDweUtuOfNM3wadMsqZEVJd5ocgD9IlIkvcwYKE+E+6zECdre87A+lpoEmeZNqavFebT8GfzuYt7O1p0BPVXXVX8TblblWWsN3Iw8b7SFhWQrI+bS8u7OcTFLn6RbPfjUFHOuTSZj9doRiFP51PfkgvZ+qZKvTM3Cr03PFe/7hXknQ7e18OLv1hKSgl5l4g7IrCWzS/BSz9N4ddNm9Fiz3mk1y3ipoc7UKOUjWJuuyLvVwcfZMRno1YU3r3GgncwYqaQYyuf60FlnjlrGh9Sm9ICj7nUbOYSLrzSni403QQvNslCTSXcW6GGFVhRDYogj1WHeo+Iq0VdMePe12XMvFW3GTxVbU6Ok+bRwpylvH9PFxq0ZoPQCQML/z7u4NAvYG1MLi1ZqKEHfxj8O15nDaxFW2fyoSO2VHH8HNKVWsbZKV2p/e514jtkYOnWFpY5xPAAB2vI6aqSJfZX8n4ZMbcaa1jZ2RzarSVNujKLjFyW888J3emfGB+hOaskC7WxcM8ID/AT/ZLlfS1YqL8FFv5b4lMDK3bLHA7KakXN782ggb1XsHmPHrToyVr4zUkW/n3cPyKuGeOow7iaktXK11DjFbF0A7rdkKyvA+fy3HOtaXybyTTd1pkbevSk9dE4GzKw4F+LuYL4eLBs79VGjoEOde8Q74s7W7CQY2DjMo/PfmtDl79MIM/Xzmyy1oGuVsaa3MBCfTvkbyMmGqxGZeqyWI/oHG990iGWS2MhdqWw+3zeXkKhrRcdaewoF97xT1+69MlLaI6bZL17+l2HdkAT8O4RWwAWaisjThSs7U43ZMxpxpoFXLUJUdOk0XT2qwub9OtPO3xWw1NPsvDvY94hH93e5brMCwALNZ9RMz0vy+zCQm65iKn4klFU29mVyXkAJT73EppjYD1e81aHu3K8L7AQf19q61odalEjVhGsqg8NLM+YRTxvpx21ODuSXj535b8eDKLjDbyE5hhY8PVFPADeJVhnrVnWmPfomCk9Z/HM5wvfkvG+wcZL+MObdmRvMpJim6/k/U7DiOp7Cs1xlyz46iK2GSyMI8Tfwyd00F/pkoX65OrcWzJPZ9WOJdxzi0pbxw2j82Er+f6+UTTa1hO+gVJzJgbek7XOMS7GW9+02xOjyprl8MhFrCKeGSz4qB+xX8p1FnQiF98hVLjvKraZOZ7GrPYQmuOOPGkdPILBgkcN2uK11J7F2lUHX1vERqEGe8H8KTKvaXQpJ26/ujtNyz+ETM6s4vxxU8jp8iqhOe4q+uWOf4qsh4x+eb3wpt34w935lslW8T4u41sk/aQ3z0gR64nh7DLciUPNHCii+QBKm+DG/ZfPpGtnXIXmeCC/VgdfX7CgoXiuLr4OXKL2dh3qg8t6233aShZqile2c+KGTgMoqXlPWtPOnSv5LaSTC5zhjSj2HZt0a6pdya2b/qPdLemjDr9X/7jjOtSvQay7eHZZ17rA/qWc+mUw9Wyl0r1X7nz4wTLaEbdEaI6HGtV6i+5E9Qs6xOwjtgQseJ+LfZUOXrio54l5dKDlbckK3LWUjcPFOLhmS1s6ePCB6s40p/k8oTmeKjwBLg07Kf0KMC5WHbxld77TZB5bYrcOdfnBQlyzxqpZYjm/Xz2GehezpaNXPDjA24VOB+C80FMVe0NdsXMHpU8s2on3hTwwsNBOsBA/DBZqWho1cOaM+hPppJct/d3Kky9VdqVtvtPg/6jCX2DjzD06xAgjVtRBSbHznTOTVx7ywz2I9FDFfwMLnkGlmrtwkWIzaKxfC9q13JNbWayiRn6ThOZ4quiXj5t9pV8B4jvxvhY5zoPvis7+nY/0pUTcVpBRqqy7Uv+lC8+Om0OWq5vR8O2efPXDKup0x1Fojhfi0nQYFxjfiI8Hq/fVpZKFcQwWYtMa7LptqFsw3ZUnrp5Pzf0bk6uZF/s6udGhU6OF5hhY0ATU74FWgdV6+QrJwlxF7Dpi5sBCfQB9mCtn91lAz983pH7lvfif7W70Kd9weFzKNmJOIvYPnsZgFW7pKr0Vuox21SGmX2OhPsCetivZv+wCWuHdgN5befG2Hu60/dZAoTlesu+xngMLugcW/N3BEns3HepZof1gIQ9/W7OVHFVoLmWVrUXDSnrxiGHuVGVGP6E5qyULex+w4D2B8Q2/E7Dg3Ys6V6hRjvdYcfIWbmm9kvPr5tCGgMp0qqMXu/q604OYPkJzVqsYQ/gbjSV0RtYaAEvsk3TwhES8IljwsF+T7MoDt86lGvfLUUQ/LzYLcKfnh3vBx1OyxN4pl1XhZopdjI+PZGHfhVpeYOHfAKvlSVe2pLkUNLIMVWzlxVc93Ont7K5Cc1bLvv/Qf9ZvbYTvPFjwz8BzQcM0lvdYV/78dS4dXGpNXcd7cYdId1Im2AvNWSNZ8C6GZzTGN1i7Pm+RngtifaEz1HerJ8cq8mtdO7uy/dm5tPZmIarezYsXTPGgc51JaI6BJda98rmQ6wHWlqa+HHl1L/ZWuaxbG+/IfOQF4pvo8WYOxTc1p+afPLnlVQ/y32cLr1LJgq8vWJhHo/PdtltUbRff2LQPXiOyjagFXubKHZkn/SLDhRsGzKEm5j+Vjl29OMXEiyodby40Z63se/wNWBiT/zRNtRs1z1+ysK+Hnwq0tUejO9KT/f57F648czat9v+oLBjsxTdKeJGNd2OhOWvlHBLfDMnCPFo/+o5dn1f7JAtnJxhfYs8gn2t47ZPcsokr9zKbT426fVDWNfXi70886cf7OkJz1qqYd/AIBgtxwvj32/ofkizcvWPcI89GtrHcKX4g5lei82J6mfxKucBenP3Rk9qOqiE0Z62K94W7f7DwzXH2TbWrF3JUsnDWhPmImml4XuT03+zjyhuCnSjH/4lScZQXt67kRXNKVBKa463ifWkevfCeAKvy+gDJwnkaWKi7jPd479MZztfLlc1rLyffzmnK5zFiflTzon4ppYTmGFg4awILPudgwSMOLNxdyfpyggeW9J0f5cpP+y+nYp0SlF3iPe4R7/GbRzGhOQYW/gYs1EyLiku1y9/xVC4LGo0xBtb30BCuv8iV3bcup3eDLivZYj6qRb3o6PgiQnO8VcwVnH9qvrpgZYedkSz8DhbqQYOF2gwmz1z5Q7gT6QpeUrYO9eJ3ZbzIdUpBoTk+8j3C2xUs1LjDe4QnO1g4SwQL/j8ay23ESv44z4mseuiV+Ru8uMQYL/rc2lJojo+K7408xxYs9A3ePfz5wMLdAt7h8Imlclmuu1dypt9Siv14UfnnoBcXdPKi4YNMheYYWPL+RLAwLsHKmhksWYhXxBoAdaoxJtD3Kx+s5BXdnKhG81Cl6hIvvqR60QnHL/DVlSzEBYKFftFYeCfwnEUOFWr3y+cS46txuVVMmU5Up/cJ5eh+L55w0pPWv32rNGu2TvYXfGLBQo5TXhbiGFGXHzlG2rh/NGUVezdaQVFDjigvvL14/0ZPWnbzsbJwoYEFP0Ww4MeKv/n4JVCy4KmH+vjIvcLvqD+RauHGw8c406I2R5XZk7zYf4wnbehwQ7kYtk62EZ5rYKFf8Dc5Fc9IFry9oDdij2M3/ItBJ+66unF+cqaDCYeU9Tu9uOFBT7qeeQXewZIFDy/oKmqkg4WxinmKeFjoYHKUiWRlDD7GrX+4cVSaM7XK2aO89PBiuwgPKnAiSOnY0cAaHhMpn8vvW0HJKjHlBBvm/PlwfDfgTaixvg9z56r9XOgub1UGrfVi4xgPsjE6pnh5Glj3X5+Svrq3Z1tJFuYjWPgda3J47WmsfeTOHRq4UPI6N2XxAfEeszzoYbW9SmKCgVXV5ZD0z4WPZ16W0EnJQu6TxprRxp3r1nGhCkPmKsdWeXG+cA/a3H4z/JEl69Hw/dJXV+wXf2PVGuUt/w348/nXTZMs573uXP+4C51pPkvp1NOLD873oIuxbsqAAQaWWP+G49sI/8e8rDpJzuGyTl/BF7msghfceWe8CxULH65UbO7FL/p7kOWRBcqO7QYW/gYs1FvXWNCP6/2WSu9eMWYky+nUfl5k4sEj6rjSfZduyp5nnjyrjjutrTxRyczY8J/xNUn+DbzrwELtD4xhsLD2QX4XWMuK7+JFDTy49khXKltJUdpkefL9EW40pM84eEBLFmLHUdsPfQwW6mJoz4tYfrGPlKzdOzZw/knuvMXRhfqHVFKcD3vy546raFCFMcqECb9YyAGE9wpY3eoc4LkZu4XmrA7H+lrrL9RN3zHPnQPmuNCQUxWVsS6ePKfHSrJfNF4JOPaLhTW8xlqRtUOuyfFOsO7UWKg/0bmbOy9UXOhe3bLKl2qe3KmQK93u4yg0588s/dV1ct+BmG7kseb2ve/o31h7szzY45szzQ0aAZ/rXBbW0GKvztBo1PbTWFin2z7Pkizs09Y8cuM9wc4UU6WQ0iXOg71SnKlfxcFCc36x8DfwxcS3A2tMrDMw7pF7oLGwF901zY17V3SmdR+/t6251YPN96ygGp/6Cc0xsG43cZSsoMavc1lYx4KF+oXamLgo9pXjzrnxiOXO1Osfc+XgCA8e6LGMopb0FJqzOZeFfx++M2BhHQ0vLsTzIx9Zey6wDix344nNncl1YU7btjM9uGddJ/qa2Bte3rks/Pub/V5KVoEUV8nCnMceSWNl+/TkeTPd+EMVZ7r89WvbTmLP1/HiUjob4SA05xcL+028e42Ffa3Yi4YjJyNvG7Md3PjuhxX0zeRtW8emHnzQagltXNJfaM4vFv59vHuNhf1WxvKL0mc6L6v+CDf2snKmDJPXbVsO9eC5QxfS8RPjhOZs+V9Z2KOmF4mTLDwv9AttzMsa4ujB257MJ8vxc+FXnju3/83C3hGeoGBBvzCGl47owyXnuHGfGs7Up/CXtg/WevCp1nMpcaSX0JwtyOf7IwvefPC5BgsajTGM8bVXvMf4x8upt2ANHefB7nYziM74Cs3ZItfR0Bb08aqUX32PPSXyDDAm/Ccb2Vl+T5V1V94NduNnS5fSy/tGSq3BHry45FTa0O+40Jytcm81fuX6cEN++etcFva0iJHBGQBykzXWoxVuvOH2IqrwrbQy0sqDu14fT87TLsGTXZ4DYEziLA/emxoLe1rEd2Ju41uH9SJYy5+s4sTkmTSnfHnlcoY7lxszigovTBOasxU5i7j7lSytLWBhf5pepKsOeUXIf9ZYNUut4nazJ9CJalWVGCd3PmYxlCLLvROasxV13MS+44Zkwe8J7wss3BHg3hD6gTUL9kNgNfReyd0dRlG1Zm2Vh/3deXpgP7KwsRB7K1/U0JPrGbDgZaCxsD/GvhJ6i/079jZgKVlijTljCI0uNVjRVXTnkbHdybF9KbG38lVx9om1JFjw68S7Bwt3Y3g2fDexVo9NvSVZtmvF3r1jfzIf5Kq4fXZjv43tyaZGTbG38pVnabizBQt1zZXxhv7CnhbvEmsD7N+aHLspWcGVxJp8sgMt/L5bMdktWAVbU/86zcTeaps846uw306ycH6APSdY2FNiTiIvE2MMZ49guTRwYTeLblSh+Umlr5Mbt9zciOxMOoi91TYV/YI9H3QCa0Cc5YEltFaHNRjahzM+nG2DRZucOapFO4p8EKG8r+bGEXHV6d6OPmJvtU1F/2IvDF3F+QjOrMDC3et6o+PyLA1nf+EVDKwLd1Zw76K2VPFOirJ8qVi7LipPWb1GiL3VNhU+kribxbvH/zQW9rQzckIkC7kyuFcAK63ZCo5+V5vurX+jdEpdyW5nS1BInUlib7Vd3tfifeHd41wQ/QIWxmmPnxE6rFdR01NjfSqynDs+Kk+bypvSyjYrucKiIlTGbY7YW21XsT/HPMYaALlNGScNLOxp4dunWteR9x048wbrZrITV/xhTTb1CtPY6a4cO64AVTixSOyttss7aWgFvvU4X8V5OFjDY9rrzhe+pUPeL+oEac9VImop24wrSs3SytKEGy787pgFVR2wQuyttqvi+XVNuh2WLNx54NwXLIwTnOEi7xd3KhrLNWkJt8oqSPVzapBjtjP39DOlogsQQ7lDst6GnJYs5B3hPBos7LVLDnwqxxdydbT3uOD5Yt5dqyBlejeiJqOc+dOLHKVFGXext9qhlmveQ4zTC5KFO1D8DViIv4fXHljI1dFYN5XF3GCnBf2o3Jo2TBbvNPaTsuOtp9hb7VBxBoDzXbDgC6KxEIsh5rxkIVdHa+PFvos4/ZkJDZ+iktmI5Twr/Y1ypKw3vX2zQ8UZQLnmCZKFe0aNBR0U63rJml9wSi7r25SFvOfRV8XUryu5llvGd0a/UKjMeqE5O2WuiNAAycI9n8ZCXAXuQcBCPIbGerJyAddY/FIZdaEPNW/sxD2nZCkhnzYKzdkp82HwvsDCna32Hg25GgYPLdyVa/0VuXM++2Q/URyqDaG/Ri/lL12eKo8H+wrNMbA+X35sOKvtMNmuWJkbuSy7jgZvRPhc5LZx3jw+3v+xktpvFA27sYSbOT9RrKx2Cs3ZpeJ9iTWJZOGOW3su+d3Yk1+PcY/7fdzPgLX/8lzu+PSJUrPzRIp6tZgjnjxVyrb1E5qzS8aINFv8QbIQ86L1F/qxRZ3C0v8RsRX4N8BKD5/DFi7PleWBM0hXaDGXs32rOJXYLzTHwIKfDlhoi8bC+4U3D1jwpsDcAuv4odkc+iRLKZczl6aNWsTWo7KVu5+Qp2NgwU8HLOTqaCyM4ajWJaV3nfGpZXbz792Ua4Ape2dxpuNTpW73JTRo70J+N8icRkejZuru/+QimUoW4jE0FvQDXi84l4E/Ab4dWJvEpM/kH+cfKnMXOJNpvoWcZl2EPIefEpqzWxWaJe/5wEKuzlH7m7l6D68XsJBfg+8AWNm1Z3KVbs+VeK+V5LhtAT9+V56muQQKzdkt5xDeF1iIq8HdCVg4J43PKi+90BAHhPWXsqA373CawUMGf1bMWnrQ/tnz+WydOlQqMEhozm7UG8J6RrKQq4O7E7AQozE3o6KssY/a6qfep0nWlXPTueP9fLSi8GpK+jSPCzm0oK5DzgnN8VPx3YDPD1iIN8H5Llg4O9/Xqopkoa69dWi6ZJXwn8bDOhWllNA11L7zPO7QtyPNWBEmNMdPxsH8OF1MsuCfhvMRbV3Yzaaa9A2EF1vO/QzJevhhKi/rUYHK9PGhnyvmctuOfenDGp3QHD/U0hd7KGvJQr+gLWBhvSieKZdV5GimZKX2mcqtB9ehdt7r6dvVOTyvy2jKGYzaWH4q7mVvmZSSLPTLUq+7koX7FMQ8gIXcoheWDyTL1HcK71xjS/nbb6LEgNncc+40GuEdKTRnj1x/YRyBhX4RmiFZpzeewPdMspKjXO1cWzyUrDnmU7i9+OZX02+hl26zuIbPIrrXNUpozh55Vlv977J63Cmgfn2H4pmS1Wt6sIzrAKvEF1e7XokGVu3Nk/nVQQdqlbqNtnjP5OBZrjRwSIzQnD0qzrk6uJaXLLSlX7qBVeiuDv68kgXvuqxvjyQraNkk/pE1lI533UHeRWdwix1edNI9VmiOv+rcMgDnsZKFtjRq+0Cy4Ge83qiBZCH+bcaox5Jls2wi186YSL1ddtHXc9P46oJ15NwENf79VZv0s7i3kSy0ZWPOQ8kaMvia7vTGhtJbIi/L+vAEflFmPjX8x4/8I6fygX5baWTJRKE5/qhvogs0ripZiD8Tew3JEmtgyYK3hcbCHuZj6Hg+OsWZJt/0p/RrU7hD290U4ZQkNMdfdRoSpYOPFVjoF+254I/rH9dAj3NM+BAEbjCwsnaN40tJ7rTgyD7aXXoKq+MO0J59yUJz9qq4RxXtyGWVG2d4LrGfkv2FtSLy3ZbXeSJZTzaO5dhO3lTv3H6KMZrMS7MDiD1uCM3Zq+J+9U8s00rvsI7V4y4APgAa6/VQRy61bRPVF6xm4ZN4W/tAii5+W2jOXtS8yWWhLSO3GljQ7Sbdautxtooa+ebeT+Sd9Lllo7ljv+300Hw/PXs8kQctPU8Fq90RmrNXhdevxkJbMI7ASo4ygceh9CVCrGLNylmSNezqSN7ZcA8N2LKP9m8az6sbRFJElTShOfuQ068b+k816TuBmoV4X4Y9jBV8U/RCJ2UMZUbmc8n6fnEEJ309QNW6HaR1mx05a3c8pfdEnYd9Krzm8DdYL8MjQKyT/rNPKyxZ8H5CnK7DtJeS5bduJPtnnaTL8ScprsponjPxJvU4j9pF+9RL2cbwgJHvHjXU0RawKnawhgeLHuehMt+p8WvJCtk3grukhtLWviFkIv6/WfQdOnvivtCcfaj1JFk4o0eeFtpi0MKSerQde0fkIzvHGFi3/x7GB9pF0o2PF6l+9DBe2PYu9TuHmiT7VXybwUK9L+RWtdv/QrIQswPPM3hJwjdQY5nVGcqHZlwl12ER9MV9KDcblkZVPj4UmrNfFfspyYJfU4s6PnYF27zMZcHzrHchK5lz/Y+jgVWy1mD2Sk+k/qcj6MeUIbz8fipVKPBIaM5+1NmSLPiIIua3gukrwzp6YimslyQLvn3ac0XHDOSpZa9RE78IehE6iL/VTqWeqx8KzTmgYs2gsZAnNdr21X/OOkqjRo1kId5WjB3JGpFvIBcdm0jvZ12iRQUHcmcllUoPeSg058Bvz4Waq2gLWIiXwnwEC3lKj9e8law2O/vzjkEJVOq+jj436c+vzVMp9NEDoTkH1KBZJXJZaItlgzf/Oc8pi/otkoU47No6A+vJ2b7sdSOBdvUOpxcpfXnr2xRybYhaTweQDwO/IMlCW6K+vs5lwScMLOTBa6ziSxyY7JIohC7S5Jl9+LH5LVLrPhCacxD10jBOJQtt0Vho4yAvG8lCDPbUvw2s0XN7cc8ZSeSfE0aHmjuw957rFHD6vtAcAwtaCBbasn79m1zWxL6N9Tg7R/5DS4+/JetGv55s8TaBupmFk/2xXtzM5xrFlMgUmnNQxfuCrxtYaAvel8ZCDOXI21YyD0vomWSV7t2DrapdpYlx4fT3kJ58LT6R6qn3heYclP2F8Q0W8sfwvrT+6jXdVuoEcnWuBRlYt+Z158Y7Yiixh47KPuvOVTYmkJ/TfaE5h1SMScQXgoX8Mf3Lv/9zxlcWtfgkC36CEx+9t1PSOnOtXt3409Qr1L2inlaYd+O5TvE0e2im0BwDS+wtJEv6iJ83sPD9Fet1/WfTAjLfKafIR8kKr9KV+9y5TJ0KXaKFQzpz55NXqWAZaM4h2V+IoQQLsfydHd5JFr6/icFtpXcc8hjuzvwkWVtHdOZZvpepUNcIqh3ckc+tu0rblmcIzTmkol9afWkoWcgpu7/svUHvxTcTXmjQaHie5o//Ilkl2tjzapfLVHV0BFXoqvLN4gk0sBhqrx1WESeJdw8W6mMuDPggWXi3iPd1K1lcegBGrP4mWVE/2/PQV5fp2sRImnKe+D4l0q3YTKE5h1W0RezbJQv5VpX2fZIsfIPyT+0uvevgu7n7RbZkJVdUucCKK1Qi9AptVNvygLlJ5FICNZUOqxjzNfWtJQu1ptAWsKA38IgT+ip9+xZ3+yFZU24yv0iKobG7rtI9as09t16jVs6ZQnOOqFhHus1nqYWocVtvxFfDXkHoDfy48G/Any/R/qeM/4oZrHDotKt060AiZRZqxS0yr1Gv5EyhOUdUtKXHT1V658EXsevbb5KFdws/Lvx+IPWoXUbhHBmX5v++Nd8em0An2l2jzQdbcNL8ZPIZe19ozhEVaz9TXUf5N6hXK/bFhrO0S43gmyI99cDafu+nZH3a2YpDbydS2Lbr9LyVLXv0vUFlFok3kHBExTgVew/5N/Dnsy3zQ7IWlm+ih38a7jfBepVqeK4Jg1ty256J9Eqw6sc148QWt6j7zQyhOUdV9Mu3vd3kNw1+isanDCx4P85KGih91cBqU8moHVgl6rfgFvcSqGn961StbFNu4pdC+XXpQnOOqoiBRtw27v3Rx8UW/dTOFBADLL/B0k+wpYHlN785l+iZRNGWyTSxUxO+N/A2PQlNF5pzFHUx9JH1ekl/ZLDQL2BFW9qitq5cY2J8af01c3tTLlcxmV6aJRH3asI3ftym0UvhS3lURVuMe/eRfwNWVTXnP2tyW32lOaPk2hfv993T75LVpGRjTqx1gxqkxlNAnSac1ieVzO7cE5pzTKx9m8n3hX1iXhY0AizsreAHOtnFwNJ1sOFi86/TO+d4Kt+0MR+5n0bJk+8JzTkmn2t0voHS80zrL8QgDSin6OERh/1jXlaNljZsvj+ZSr2Mp6zyjbiTZSY5r0kXmmNgif1wLgvjGyxoRMie0fJ5wcIcAqu3vQ2HhybTlSZiTgfU543mj2lSnXShOcfUGTkt9JbfB/2P57L2sIcHizwHAAtjBaxW9xpyqvstSiqSRBmz6nL2kyxy/QI/1gA1Y7mC2H+5lgPL/uEPyYJn34xRY6X3ODRHY3Gz+rx9QxpdnpxI9LA25+/xkpIr3hOaE6DCX1MfNlSetYAV7mRgIe8hLwv/Blg9WtXhkWcy6fy6BOr1sCb77XxL+6rcE5oToKItGJM4A8K411jbnfrmsuARO+CYYXzFPq3FL948JNNNCeSTXJ1f7vpIa6beE5pzHOcA8BiSLIxvjYX3ARbOOsA6ctAwH5u0rsWbOjyhCYcSyfZBVT758StVmwvNOa7CfzAvC+MbLPyW9c1Rjgm0UZuP83rV4GqHnlONc4lU6XxlrnPnJ4VFQXOOq+/cHH5jeVkbWBgPI7c65o7VJzsNrNZVq/Gu8q/J7GQieXetyC3XG/Pupg+E5hzHWe1vLPQLWN7vxskxgbmFOTTNyFiyoowrc8fFH8gvOJHu1CzPfvtN+UEG1jknVHDystAvYMF/sFfiGKylZa3zj+MMrPuRFXjNmy/ULjKR5r0vwwVa5OMO/g+E5pxQkQuTl7XcwagdWKihlpfVZbSJZAUdK8euH7MpNSmRvnYpxV28Ldj84gOhOSdQi/o3lnmwgYVa22AhzgasFkVNJavHyrL8ueZPengnkdZ/tubGT614VpVHQnNOiL3VhN9YpZYbSxZqlUG/EGcDf9wH3gbWt5GleUNRY374KpE2VyrOb38W4IATD4XmnFRRWy4v61EJE8lCbTmMYcQf4fton2baDjVm58eV4J/9TTkpO5EqrizK95YX4i3PHgjNOanu7D7nN9bJAAML9Z9OvR+i79e9gmQ18zJrhxqNw1cXYxsrcw7In0R7jhXmJseL8Df1kdCckyragvmosdAvxbe7wC8TNfnl9wlz6+jufJJ1oHURPhNrwZ/iEyinaUEOW1qc1elPhOacVOuNWAzfA1mfEyyTwwYWcvnwrcV6Ap6z5yeYS1bSy0I8rZEVe6cmULSrFe/6pwRX2/BEaM4p+MTKfx86BRbaAhbq4GB+iX2krGXv9sPA+mRdiH+k5ucVnxJpSkELdhlQml/EoJ7oKdSGR26H/EbgO9ihbz7JQq2hfgFd5Bpz2ugT8HqXrMNz8vOd+oX41sAksmptxvOrleW/Z2QJzTmlos4TPFwRFwXP2SJ/GVgz9qyW33PUEu5y6aRdw4+WknUx24IbxxXhnBPXKHS5MR//UZY5IktozmkVdaawzoIXLvwKxN5TspB7CJbNUgvpzyv2DJJ1CDW4DhbnkuOSqerUn3RiYDme0+OZ0JzTKjz40BbEeKEtfTZbSFatUd7IO5CsZn+dtttoZ2AFLTbmkj7WfPHMNbLe+o24cTkeP/m50JzT6j7L1ZI1rXFp6c+bXcxSsoz1PvJ50cYOgWfEXtzAunHmJ6VWLcEDvibT3qKf6cqbsjwh/ZnQnNMqah2BhTUb/HlXLjCwUFOnXPMekgVvVbH/kKzgn99peog1h/pfpzoP3tE4h7J8ueEzoTlnVPSLxgpYddquQLqBBb8LsHCmEG0ZbLfPMr9k+RT6h+qI53pwJ5ni7F9ThcZl+JXfU6E5Z+DVkMtCW2bXspIs+MzgW4Tn2jcpxC6rjYG1qd4Hiv9ozZ8DrtGjaS+ohVlpTmn5VGjOGRV+fhprbMeziGmSLOSjQr+x74BPrPNbQxtnlnlFL5OsxbhKoku7n1FwrZJsVB/1fc/AJyOXBW+Lf1YbWKj1gzFca1Qh6Y+rsVadfU5JfsV5mn8C3W3xlDbprdl/9COhOYGI5UeNecmCfwjeF1iozfR88kA9YuXgj6v11+QDWVTbvxg3fRtP+WIe0shJxTnz/H2hOYHyubDGBAtev0q4gQWfPcx5xKrBI0NjXdubRZ3mFOX9hxJoimkmNVSKcegC7K0CVdRAwp4ALHikaKx/9m1GvqL8HX4XWt8Pm/uESj8owpVqJ9HITel0LqgI//MD65xAtc/xjciPkmdmpT6fy2WhZhS+K1irwyNDG6un0h7QItcivC7lGgU2uUtW/oU5tuA9oTlnVbH3Ry6hnENoS14Wvo+4c4cHscbympdOte8XZqX0NdpbKo32Dy7EPlHpQnPOqmgL+hj+zGiLxkL9Kawn8G/AGwa/I+fnaloaxe8rxAdDk6iK0W1a1aQg//3yrtAcw3OVuTJY7gngKaKxUDMK3sHQaPhaYA6BNW9VGjU8VJAXBF+j4Z9v0guzAtz0OWqTBqmozQS9BwsePHlZ5t4GFmqIYNyBVftLGi0bVYAXBSXTxdI3SffWiu26pQnNCZLPNTFwuGTBczaqav5cFvJ+wUJON/QLdXSfzk2lt4Pz86vB18lyh9gL2Vuxx1TUOQ1SkdO+cOkIyYLPjDZWUbNp94Xx0hccueaY82AtX5FCpnFW/HPAdXrlJvYMPpa8aNodoTlB6vCJW+X3GSz4AmlzaFpjXz1yePFOkNMNjQardeZ18jplxe7nr9PeFUn0860FzyuCmqnBkuVbaJRhP2ZxKZd12tEX+cNyz4U6PNpzNa13ncrcseSU0dfpzpxEmsQW7FE2VWiOgYX9Bf4GOfh5WchTzlYryfrrf0UYWN5NkynslAWnP7hG2Z4JZFHBnNWTqL8arKKPsQbEugF5+xoLXpWohxx5tapkjRlhYFULv0YWn/Kx1fcEWlArnkq9M2P7+zeE5gSr65O3yHUp1jPol7ws5JVj34E2VqxvYFXqco36pZhxyZXxNISv0oB4U25tAn/3EPlceF9YS+ZlOX31Rb0/efeL2gAaq/6HRDqWYsr68XFUd24sFbhswvMpUWhOCOJz9OM7TJbreLA0jYY3HuqfIuYUbcd3G6xarePpdbIJG8dFk8eyGMosb8Krp4r937EQFW2BvwJyEqS3wjrLXBbWGojtBGvuCQPrwuRY+r7LmCd7X6Z3V6PpQ3NjbhsYJzQnREVb4NuM2NJ/sxZ3WyZr/INVyNHA2ncgmrr4GvG8qhF01D2aKt804g6d4oTmhEoWavIithMs8Q3LZWE9hzhN9NfLLgZWxIcr9H1EDtkl6anX5yvUoLwRLy4aKzQnVMU4Qh/jDgws9PG/WXiPh0sZWGv2RdPBLT+o2HsdPYq/QrFhOaTLwL1VqFrn51Y9/GEQ15H3ucxGbtOjbgBYqGWA9RdY1mNjaEvjH3Q4RE+rP0bRuMifFOmAe6tzkoWavBor7R/D2gR1z1BnFCzUNR77xMCqOi+GZrb7QYOHX6IRAy+TWv0nDYyMFZpjYGl+0ugXbZ2D2nJY5yF+FfWWtTamjYyhWi+/04W6EeSbcIm8N/ygq71iheacU1HDrU2tJZKFtuB9gdXs/A7UfpD9mJfVtekV2lToO8XOjyDTzzq6s+oH+XvHCM05p6KOBWpDgIU6+hoLteVQrxa1qMHSxsTAH5Fk2/E77SgfSYurXaS9Dj9oS/YVoTnn1Z1rtqPGg/T8QL9oLJuA3XrUf0A8EWpdb4k2sJ5/vUT+MdliPR5Bdfufo3xlftKEl1FCc86rb913oG6kHrlueVmoLRdQY5X0mpF17NcZ5uOw1Tqq0y+bPu7TU/jiYFpbP4eig6OE5pxX0ZYjB1fk/o3Ggg8uanAiJg+/Y57i27GsbRgNyPhGV5aHU8v3gTToWg4dWhclNOe8erjTbtnHyOfD36AtYMEHNy9LW6+Wzw6lpju/UUezi7StdiA5FTNijw1RQnMuqPD0beVr8KbG32hjVWMhLkx7LrAyzgeRyfpsmp4RRoeLBJKFeK6C3y4LzbmgorYJasxqLG29Ck9djYX3C40G62vLs+QwSoyvVRdp/p5A+svIiLOrRgnNuaCONPdHbc5clqYTGgveEhh3Yq0p93wjFoi/v/Kd5ty5SHdCA0lXxYiP9IMv+AW13K09qLP5P1haG1EHXPt2gHX1fiB5nvlOC+qFU+NJgbR9iBE/9MRdeRjyFf4rC79jbmnPVe3QWbIda2A92R5IDv5GbOMAj/EwtRcZWPOP0//KwpxHP4J15fpZarotm6qL9/g4IpDe3DDiek6RQnN+PRdi0v43FnRVY7Xtd5b6T8+mhrPDKDErkMYUMObKx+FXflH2/f8Xlvw+ir17RL1Asn1kYPV5HkhzLI3Z9lik0JyLyNP5ryzk8OZlJcecoUzL75LlkxRIhR4acZx1pNCc/5uFfsQ650+sTT/FuK9nzC0yIoTm/N9tRG121MH5Uxv3lzhLrXsYc06RCKE54bnjCz7u0gfkXyz8jnpwmFs4v7ccE0jhttnU+cl5ujL/LHmmG3OJvZeE5vxiIU8X4/vfLOQ1w28MLNyVlxoaSG+rZFOA6zmqkHKWBkw34a3NLwnN+Z2Fb9e/WYjFxNpXY61PEKyF3ynB7DxteXGWGviY8IUJeqE5v1jwl5ceUv9ioc48PNXw3QTL5VMg7Xz/nWwnhFK9WkFU9IkJe8fohOboclnIa5Y1kP7AwpoYLMRG+eUEUlbRHzTzZwgFzgyilf1NObauXmjOLxbqTEhfsT+wsFfAPhy54I8HnKVx1j+p25sQerUliC57mXLjIXqhOb+zsF79NwttP1oyXK5z2vacwGb7ztLSLz8pqFMolYkPoqHRpny4PGqd/87CnuBPLHhS4hv8zWQaF35zlvqk59DdPaHU9l0QeWab8rDueqE5+t9YWJNjTP6Jhe8AWB+VIPIQmlXvcyj1fRNEjsZmPLK3XmjO7yz41GrrHLBQ61xjYZ0BVtiaILK/YsTVe56jmuK5ihQ14wdH9UJz/m8W+h4sjC/ku+dlHTMPJr92Zlyi6yWhOZf+f7HCzs3+X1kdO/53FmpUgwXfS7DOD1j8G+t542Bq6WLGdOOS0Jz/zkI9d42Fd/Jv1rfmwXRyrRnXrQ/N+e8s1LtG38MvESzk6eRlpXYLpoonzdhmDjQn4r+yUM9dY+E79G9Wkz7BtDfGjOfXihSa899ZOGfTWBjD/2atHxFMHcV+xv9GpNCcXyzUhfg3C7Wz8W9g76y18bqYz3N3GnFWaCg5OgZTpRtmvEGwMjN+sVAXIy9rxjV/1JSWv+NMAfvHpQVW8K1+QeQ224jjq4XSqK9B5JtjxvVaXRaaEylZOH+Eh9e/WTjLRPw1PDzlGqCtGx8uEUQPixvxmpEhpJgE00OLfGy8AescAwvrP2sPe8nCOLKYu1Kyyh3wkv8GzhrwrYW/O+ULopdibTOkXiilzw0m/0P5eI39FaE5BhbGUXWHTpKFfvnk6S5ZWW1WS5bXyjD5HsFK/HSW7mfkUPhHwRoWTAPW5uNh5aKF5hhYOOMFS+1gYMHvFyycJa6pZi+fC+8RrM6eQTTyqliP1LxAWdOD6fK+fHzXKlpozmXJQp17sOAhChY87DUWamXAc1Rr48QPQXR3ijFXaXCR6h0TY/VbPj4954rQHAML7wssaHFeFs5+UdsEvq54J/Cdj3IIpnOfjbmoTzg5vgmmxv3MuavNFaE5BpZdR0/c1+fOO40Fz1f8Dr9d6P3F4Vt5cXgwbdpuwoWSw6nFrBDyLGnB9atEC82Jkiy8e9SD0cYkPOzzsnAuBr1HHv7MK8HkctCEF1iH09jwEBq60IKbekYLzTGwUMMPXiDwT5XrhknrJQu+ushV8Nlwzs5mqUU75AbeqhJC0xqZctXJ4dTgYwhxhAVHn4oWmmNgof4+WDh/Awv1AcD6zzmuZEGjlfo7uMzWECqTacquw3RkLZ5rgbsFT9kVLTTHwIJ/Lf4GXsNgoT4AWFM2eOvnULdc1o8O27hYRAgtrmTG0Vk6qukcQol1LDjNO1pozhXJGnnbS9b1wbkcWNs3b5Us+COjptGNy+dk38N/2+ZaCO1pZsZvXHR071EwKYo5byxxRWiOgYU+3nit+/9g/efsVz4X5hbyH6fPCaFjR0z5y7JwGrwomL6JsdrDBXsrAwvewdI/d8DvLJyxop6RxqqQ4M1LC4fQ2+KmfD4ujFrWFvpVKx87LcfeysBaMtRH1qDCmATLf7Chv1BPHfXS0Eb8Tu9W89K1wWTjYMK97pwno7dBVFFooVEI9lbRkgVfgNjU/rmsM+03SpbltC3ShwW/Q3PCyk/hsGrBFHnGmNe1OE+DxDf8aKopp/W7IjTHwFIfb9DDl1VjRTVYJ/dDYKGWFea2tv7yrhRMywOMeUnPC3RxehDF+5twySrQHAMLZ795WdCcvCxojmS9s+d+rYKp/A1jzvQPow7dgujmFBP+60mU0BwDC2fiYEEPwPJ6Mfs3FuYDdAJ75G8ZQRTZzZh9P4eRdbUgGkgmXPxMlNCcGMmCxzlY2lj9MGEUY60OFurLQe/l3Npak2/rg2h7RWO+X/wi9RT/f2ScMY+6gzhkA+vgYQML/YK/QS2evCzMeYPmFGfbZUEUd17sP8VzLfMLogPexvx5W5TQnN9Z2tyGp/G/nwvjC3XvGjcPonE9jHieRxjduRRE7tHG/DMlSmhO7B9ZqGf1bxaeC/X48rJGRwbRycvGvOtmlNCcP7NWFyz7RxZq1v9vLC/PP7NuBBVk/K6x8H2UY2LPh99Y3XoE08Wnxjyz8BWhOX9moYZeXhZ0DToBX5G8rL0ZwTT0gtDrrzjPifsjCx44Ggu5Vto37d/99Tg2mIyCTXjb5GihOf87C3tnsGQNt5WGsYqaqXlZI/eGUK9tJrx3aozQnD+z2rf/SXbz/H5jYUygrnVe1oQD52haAxOOnRAjNOfPLPh3VH60S4+zfbAwt/Dt+Dfrx/SLtKa5CRf1jRGac/WPLHhuhFXcqcedA+oqQiP7lTdvh/q+eVkL91yi9iYmXCY+VmjOVXmmkJeFtqDe9v3w7XrchaAeG/Rj/NR87VDzuUyO0IaqRtzCLYyG3b5MjVKMed7NOKE5V1Wcv+Vl4fwLtVxx9pdWdJP8duC5Mszz4TtE+zaeo6h9P+nvWWH0OuEKnetqzFXn4Az5qjxLy8vC2Wdy9fMEvw14cYCF5wp7bdbuu5UXVSp3kToX/EE7xodR7KBoGjrCmEf2xxlyPLzFfmOlrzBvV6v/McL5JljIC4RP+8IwM+yH6Ol3PeW0zybn4WH0qXksbextzDn1rwrNiVfRL5p+gdXExLyd06qdhLsTfNOkJ7tYmxSbJZ5r/DiaOOISHc76Rnt/XKC6b+KoyX5jflLuqtAcA0vTVbAQQ/AmyoPK2G7VHw1ej7tkeZc58b2pZJkMvUStL36jcnsvUMW7CVTU1oQti18VmpOgDh6yXbZFY6FfCqS4Eu7T8N3GGgB3iYg5+N6fiUpF0H3rb+T24jxV3JpEIS4mfPZTnNCcBHnmjrZoGj1gnxn0nnBnB98Y+HJ/HhtqN7iuYJWzoT39o+h+rW/0cuZ5OuVwnQ7HmXCFAleF5iTIOx3cjYKFdw9W6bZDqEHBzfDhkOuyrB0hdu8zTCSr7/kYSlj+lb6WO0ezHW7S5KGmvOpCnNCcBBVtKea5DvF/8v7Rq4BZu2lTuxH6EOsvrOU27gm2W7tRsEJbULszcWS9+ytFfg+h8la3aXUtM77T7qrQnETUS9O3qOMja1riW49+ObimHaEPsSbH2pcPBMmYGvGtpY4u8dR4QzbtcQmlJqZ3yL5FPq61PF5ojoH1qIG3ZKGPdw0zsPD9xV4Bewib9LMGVv0B1LpIAoVHf6cX+0PobPM0WvBVrO+/xgvNSVRxl2qeuEaycI+cHGUiWbh3x9oTewXEAyA+5nvscApySaTpsT/oeQexBq57j3wczfn16QShOYkq+jjw+mrJGtniFwvxAPCkQv26Il0D7YaeNjawdl+jzh1/0vNxQVTWPpOc35lzvkMJQnOS5D0y1oVg9ZoeLONgwKraZ73ci2LPF9bzDOqCSNayrBs0oelPaup1lrxLPKTVwRbcWZcgNCdJ1doCFvoY78trqT0hTgC+V6gB+jbktIwnAuvxtBTy6fWTWmwLpEZTHtH4tZY86Su84pPkHb7NUg/JennE0McOw3rTgAvr9IPrrpTncoiF0FhFn96mZf1yqEjDM3T542OqUdiKX19MFJqTpKJf0Baw0MdmjQwsr+rr9PBowxky4k1udDewErekUqngHArof4pmeGTRT6v87FzomtCca/K5cG4Dlu+JQLtL2caShXriuGtCzQbEe3R7ZiRZdbul0jwrI75pf4LuZD+ncWn5Oat/stCcazK2AG0BK76U4X2BhTUs6kqj9kZe1leHOzSpoBFfyR9Apde8oEoPC7DrjutCc67JWAzcK+Cb6vHkjOyXZt37E+YC7tlQdwUsn7KGNu5Ku0vtdhtxs2bHybbiKxr1tiDTjBtCc5JVtOXdUye5V0CMCPoFLMSO3IqcIe8fB3n9YnVzf0Avu5two8OB1LrDG7r3rRCnfL4pNCdZRVs22hj8H8FyijOw4N+1KmWKftaMenbWg3618dSJR2Sbz4wH3Amh943fUfr+wpzaNEVoTjLqPerDMubqUbswZ4VhTILVLWeNHjFriNO8VuMU6hBIVlS5p9TsVT6esFys5WZ/pAI5hfnh+RShOYbngrcs7jUWlv/VX8snrZHxAIgfRTwTYvLA8umRRaGHLHh/eji1c/tMLQYU4YrbU4TmXJfPhdrhuGtCrFGdJCPJwh4JcQqI5Wr15UTuc/XNfkYLwyy5bC89jS3yD90OKcKVF6YIzbmuQm8SS06Sd2BgIY4PLOy1wUIbn2Qfl7+DddVPjIPjljzRXk8uJ77SzEZF2XIE7sqvq+gX3Psj3x1zBfGNYEG7Pl8eK3N1y4w/LmMowdoX+pp+eltytW862jLoO+W8LcKDv98SmnMdNRBQ61ve8+Hdayzs5xHXgedCLFekq4F16d3fZGpuxWUn62nBzxxa6lKEHx1OEZpzQ8ZGoS1goY81FurFazG6YGn95ZjznkaMt+LYaXoKPWbM26ILc8ujKUJzDCy0BaxLw36xivzlJuMeEb+a97kejftAx6KsOGCGnlxfiL3Q8MJczeO20JwbKvba+Pdl/mPdk/LfBwtnPHlZp5saxn3rwZ/JeIAV61vrqdcmU56VrzDX3X5baM4N1KLOZX2MOiH7GCych2osxPFpGn0n7Cvlu2vJAw6KMVHFjDd9L8SDH94WmnNTRVvysrQxgfhC/K6xanU2fIc+/vWDzqy24I2H9XSvdT5eP6wQtx2RKjTnpoqzyrwsxKmChbM67bmC/I/JeQpW90E/qfEyC24Wqqcb+yw4VS3El7vfEZpzU0W/aKzTG0/kziH4uoKF+AnEHeLfAGv6xBx6NN2CB77W074XVlz0eUEeeBfxObdUnO1qLP+447maA+9ajYV4TPyO73bSSCM2K2LJfOESnV9fgJ95FeTJ6+8Kzbml7hq2MpeF9wWdAgt3y1o8eaFjR+R7BCtO7DNKbbbgB14RNHViIX70sQBX+ob4nFsq4kE1VtTkgFwW7s8R5456g4ir1Vila+TjQJ05P6wXSX9VKcJlAgrw0aV3hebcUhE/gLaAhRhKre/hh6CxmnQ7nMsa423B6+7n41tTI2lEpWL8uGMBvjA/XWhOigp9RlvAem51LLfvO7SfJ2OAFq+uIeO2MR/AKpbPiitez8eXCkaSVVtrLuWRn9++QO5Diqr1C1iITddY8CO433O4jGkZf/YXa/J2Kw5ra85Fz0SSaUYJDrbMz7sXIfchRUW/IG4ILMSvavMRcSOIv0IcckavQ7ltTMzJz/945OMfUyJIN7MUO4hxcbsech9SVMRhIDYKLLwvre+VLdNlXFigcVW77RUOye8AWO2vFeSGG814bpNLNLB0GaY5VvyzEXIfbsvYYcQbg4XYZY2FbxDyGBDXCha+52AdH1mELR6acFQlHbUwKcdlxNw0GYrch9sq2oK8ALCQx6F9hxADDh8BxCGjjRrL72JRTmxswsErLtLBjeW5yX5LdnBDTOBtFbHeiE/XWFrfQ7cR34f4L/S9nNuCFburGE9oYcz5Jl2gy9Mq8tRnFjzEKFNozm0V/YL8Do2ljS/oc+CYnjKvCPH32trXd18x9ksy4glOoTSuS2W+Xt2CM58g3ypVxfcMeScaS5uPGKeu5t31DQoacqQk6509Fd5RnCdZ59DUOkEU06kqXz+Qj79fvC80J1VFvBjyYVBLFH+jrQEQ84g4zR+ni8m8Iqw9wUr/WoIbzM6hOj9DKPtZNa7rb8bJpx8IzUlV0RbE4srazoLl98jAQvx3h0ed9aj3h7GCtTpYVbuXZbsFOVTqaThZBdbg6v1M+UoB5HjeUdEWscaR8dFgIZ4cLMQvIg4Z+WkYw7p5BtblUxW4UCMjvvEuihp41uKt+4y5cNFHQnPuqBinYs8jY8nAwtoXLMR/BwR1knHbYCFmHvu0dZmV+IO9Eadfj6W7iXXYoUkONU94KDTnjoo5h7YgLi7vcyE+t7rDLxbaCNaoAlU4fbIR1/GMJ9PX9cR6/JtYvyPH846KeYJ/H7lQGPfYj4GFdmus0QePGvZ8gnXuRlUO8f5BD07Ek/nwBrwg6BN5bkPuQ5qKsQUWcr7zspAbprGgRXiP2KelOdTgY7bfyH1DIn2c34hfXnhLrSsj9yFN7bauVy4LMfsaCx4VYLWoU9iugXJMji+wGp2pxddmfKD7rxLoepEm/P3JXxRT7qHQnDRVawtY0C+0BawT1dvI32Utq5YBcqx8X1ab+k2rwwdjX9OZ+/G06klTHjr/Ma2+8VBoTpq6ppp9Lgv9UuKLYQ+DPDD8jlpS+KZgPvzoUIbmT63H+w4+p24H46lqdnN+kHCPbkQiDvmuGrVdzWUh/n/KYpN29wNaEPLm8Dvio/GtwzoDrPoD6vOlI4/JNeoqtTVpyeuHppC95WOhOXfV8Y+VXJbWljIJDeCXKX9HLD++wcitASsqqAH3nJpB+5/EUT23Vvz+QBK1DEPuw12ZI6Wx0BboBFjIpcS4Awvr1fFzc+zAaufSiA+9TaGG+ePIp1kbDlJj6bMlch/uylw3jYW2QO/BgkcG5gPya7HGQ14RWL4nGvO0eolU3DaW8pdX+FG9SxSuQ+5Duoq6EBqrTqMTuSzk6iLHE7H81auctqvZ+zs8JOihU1PeExBNFskxtGU7cZ9P52jQhqdCc9LhsZTLwloO/QIWcufB8u1pLvcjJ85+l8+12K8Znywj1l6Xo2nYIubwsmdo6tmnQnPSVeTaayzsL5A/BBby4BGzjlpl/ZYGyrxIsP5514yDTp8nC90VarfFjl/bHaN9DZ4JzbmnoraKxprY97TMawKrdyErqYVgpd8PtGtT65tkldQ35y5fz9C1bVFUK7Ed27nvp8LWyH24J/N+NRb26MilBEtojHwuj1X5DDkG0f9I1sU9tvzD6RgdOHCZdk9uz1vP7SKfr1lCc+6pqLmisbB/RN4eWPBc0NqIGH/XCV8ky6F3S74Tt5fcS1ym+t4duIvlVsopmiU0556a1SZ/LgvnEN5VsyWrQ/uPkoW+B6vR1M+SFTG7FRtN3UmLAyIpeFdHvrJqPTmOfyo0J0NFrSONhT4OjPgqWUGNX0sW6hbgDOZFKwPLMqQ1K+oW6j0rkqaldOQDE9fQgcpPhOZkqPDC0Fjo43Kb/5GsmpWzUKtOsuYWCpL5wGBdsW/DuoPr6Uj+SFq9zp5jk93J1OGJ0JwM9Xq/bJ3GQluQ9wsWalxobQQrLOODZK162YY77VlD6UcjqOzBTvz+nQtdnPxEaE6Gav3sXS7r8IKzdtzcwPqnaar0MsJ7xHlKQAkDa+H7ttzthRslLYygVTU6c/jAJTRBfSw0J1OFf0Re1iHzz5K1+EWy/B21YpErUv30e8kyLU+cPMCZsqdGkMf2zuz5fjaFbXokNCdT9S10X/oPgYU+Lpz2UbK+7b2ay8K5nMY6c4l48OZ5ZLLvEj0K7MxDLSZT9KeHQnMy1To+aTrkLYL1bXaQncc8Awt1TzQWzrIk61BR+hxEPD5lGt0J0VOJqM7sWm00TR/yUGhOpooaWxoLbUFeO1gZyy/mspDDssb1nV32ng+K+2bi3mUmUMHmejIb1IWrxg2ghaUfCs25r06umpzLQluQVz79e0USzyJ/XxhmJs8xT1X7G95PSqWZxEMdR5H5WR1dT+3COzb2pKFbHwjNua/Gd4rNZd2+/v9aO++oqI42jGOIaOwiCqImanSJsLJIZ++dd11EhVVKYq8pRo1dA0ajiQ2JJUaJvQViF9GY2PWyosYeWTQJBrHRRGxgQUOs3zyzubBYzsl3jv/ec/a3d94795m5M/M+706R735YW5txzRDXB9+1F2t/LveLUFNPdrEjWvNjNzZ20n6W3i+MCrqEsBo9c7jmXDZqhx/Yj7FIZcGfoGE/O8a/NcR1/o4LFrwkHu/eJT/ZTjTp7c4svcZ+1tHVRFc/lJhdDOY52Ub45KksxBg5/Zdc82T4+mHshhcyWPC4AOt7TwN16d6WOZrN7NR1E7G1PmyaDvOcbK73W8tYiAu8IcCCP6XKwvWxNa6LNt6MMNDVBgFsXj8zC87qRPF57ixlYi7XnGyu95sEC/kS+A18HsCCpxFYfOwX1+FVAlbrN420q7U3ewM+Sos7U6dzTdksPj6mnco2Npu6XvwG+fb4jfbUTcGCd6Mtq25ooWija7V2/H3UsSF8/Ah4L5zeW9+AyZXyuObkCD9R/KbmBEfxmz10XbBQiw33C5Z72i7Dl65XBas0PYSudefzivUnWbMx4fRRsxpssUce15wc5AUIFualYLXJuiZY8NlCn1BZOTevCFZynw4UqzRhlvg05lkYTsEZlVjYrDyuOTlGeGCB1W1f7QosPr8uY+E5HuqdL1hJn3Wke8MdWe39FhZXNYIext+WWwUj3yrHiLaAhTmuGhew4PdoGy/46jz+eoMcrgmlkvUO7ES7dNYkNYI67s6W9amY5+Qa4c+I32D+h9/c2VkgWL16Ru4vKWlXxqq2Ikew/H8JpWvzH8njTqSz/o8jaE6V0/LAjByuObnGHV4jBAvzP/wG/jlRfdLlr3qFoMZOGevhmWzD47dmyZs7h1FakyK5e+FpVugTSW9OPSj3/hCak4s81v38d2Us/YM8w68rFBmebLasT9Ze5joRLRd+HEZNLl2RU0afZp8NiCTjjW3yvihoTq4xoEdv8RuVBR+kR8ovMrz6bVnw/wIrfEkYJa7IkC/MTWejZkaS07D18jch0Jw84YVoy6I3cwzrGy+UUWPclgVfMrCiLoXR/vG/yrsmp7OctZH02G6lfFAP/5w85Ki/lIVaAWrs0b+ULRdFvD4OMtGUuVvlnZw1jN/X/pgF8qkx0Jw8Uf/RlgX/MbBQXxRxBAv7Q+MmWu+r7UATnR25Sr4Uk85m8uf4JGqmfLcdNCdf1KW0ZZ03XBYs+N6q/QusHtfOQ6Oly+NNFNhlmawbns6yXSPJfuAoOWsF/HPyjagJr7LQFsQYLPjoq+8jWN9+AFa0ZJZNVKVosbw6MJ318o+kdQnd5axn+LbKF/W3VRbeleT8C6g/JMMrVr0vXB9+4JxgzXQ0UcTQ2fKHpRa2b2skZceQvPcKvq3yjag7YMta0eiCIVuuJi9MuGG2fY7wnQMryNdEffaMl1OKLSy0YRR5rPKWF5fi2+qKEW2xZV0Ot7Lgo5/v0a5MV1VWtxgTzcvpLOffsbD3HkfSVyeayWvvwj/nCuYmZluWfVGWYPFYC1Zxd+uYBh9bsIZFm2juAlk+lGthmztH0htDGsvF31zkmnPFiLjYsu61KGfhOuYmGFNUVvZoEzkO8ZUbZVnY5OBIGtujsdxgJtZzrhhRd8CWxecEguVyJFNcx5zJlvXzABO1bx8or/zDwoYWRVDSOme5U7fzXHMKXrgv1FEAC77/uI65HFjCd5izdnQ3kY+Dr7zyqIW9b46gAS3qyf/syOKaU4A50ytZiBd8tjCfgFcv76v6pYNNNLl2C8FyjYwg58GO8u+TznHNKTCqcVFZ+X2sbYSvMVj4hrFlTYsz0XSTkzzmjIU100SQR5VasrEgk2tOgVGNi8qCFyNYqIeA6/BBQhtHW84KVkisiQwBdeTGaRY2bUo49T1TVR44GWvIV41qXFQW+hFYrr6nzHi3UafBlnV9iom+alFDPnrcwvYnd6ZGg+zl/b3/5JpzFfPCCix4PqssjEPI1QULNYPAGjjCRKZKLnKHQxY2KKMTran2hvx05e9cc64a4c9ty4IXtcrC3BfjE+IFT0uwfhlkIrrfSG50wMI6njCRRy87uY/LGa45hWUsjI/PszC/v3W1jtAPlZWZHEbbklzlgUNPsYN7wuhC2BPpq09Pc80pZ8FX6HnW58wk5gbQHFHfirPeiw+lLttcZM+i40zXP5QKb5RKsdssXHPKWcgVfp6FtTRcBwu1l8A6aRdKRdud5Zrex1iAfSjFb/xbig2FT2BhWezlDKeXsnAde9Uqa1u7jpQR7SiX5B1m9ZZ0oDTXe1LjEb9xzblW1lcxZwILvtoqC3nlyCHGOQWVdbdaR3KsXUs+GXqYTbsVQh8fvyXZeR/nmnOtrK8iHxksPHuVhVxwzBcdWu8Rtb3ACv+iAxW5viV/OucQ2/xFO9pb55o0K+Ao1xwrC1qMeSFYeF4qC2tQ8NWxZYX6t6c1DxzkPTtT2Vt3jTTDN1+aEoQzgdY2oh/B1wcxtmXBbwgeG2ij8O7mrMgzwTRkj4P891iFbejQlqamXZIOtz7ANee6YOHZY9150vGKLKzhYt8KZxXhpQrWjKttaeMwe7lnw73srfZEkd6ZUolTCtccKwsxho8Jnhf6kcrCOjlqlOC+hHc3ZzXuZKC3f7STu0XsYj1uy5R58Q9pxvG9XHOui3hhPQ17cIgLarGpLOQpo+4SWPCoBkueyKjeiHtSTOh2FjFCIl2ldMn0+S6uOVbWl9ej4EsnWPABV1lYr0W+JliojQhW6QyJmu26Ke0K38qi9gVRq29PSLnbfuGac0OwsB7O50iCBb9clTUjpD98zkQchb8vZwUeC6KumwskOTuZ3R4YSK76I5Lp0WauOVYWnhfWo8GCP7rKwt4FcsrQV4QfMmft8A6kDR1ypNEbN7LkDH/qozkgpR3awDXHysIaL/ZrwUI9Q5WFdXfkBcCDAHViwVrX3p8absyS3LzXssnuAfRd84PSmG3ruObcFKz4j3qKMwRgwV9YZY2tMVScm8Zaww+z0wWLWXwoXPe7VMmSwL7fHECBew9Jt9LXcM2xsuBvgtwatAVe6yoL+xSo44g1K5W1eqU39alrkdI+Xc6y7AJoxoIDUnHzRK45VhbWt9WzM/B2Bgu1FbC2z+fmYv1JZTXt4013mqZJ2+2XMs9Qf/Km3ZLvtmVcc6ws7IHh3NJuww5R8xasFTeOmLHngPML2HtFPWmwNtfzpiaaU1LDrIXsUqw/Tcz/WVrWfzHXnFuChf3anJRIEReVhbo8fd1GwftE7G/rj6YJlu+WNnT4xEnprarfM4fZ/nTn0mppZMICrjlWFnKu4bOO9S88L7D42GPG3j68wf/03ixqQ4Pl1L0NmZafkOY4f8ea1ven2ePmSLNmx3PNsbLMnQeLGr04C4I6xGChRgZYqCksV0621vLmrKxzXrxdx6SEgFnsnyN+dM9vhPT92Tlcc26JsRZ7HvBZx9on4gIWauxg7wh1lrG2jFraYH1e4kWfRh+UmjvPYHci/Cjielvp5HjU8Swy4nmBBZ91rO+iZjZYqJtyr+voVPicw7vo4aqTgrUnyovqd1srabKmMZeLvlS9en3pQsY0rjlFRsQFLPisIy7uT8pZ2OtDvXJ42H3OrKwFJ3S07J8YyTH2KzalmR8592ogJVf7mmtOEb63zdjvQs1mrG33H1TOwh4k6lX3Ll1dxtK011Fkb520JPBzxnr5UcZAZ8lhTQzXnCLkBpofjx4qamZjH2h++m9lLOyNovZ4f4cfDRvWnxCsyjE6WpFQX8rRDmM37vmRe09XqYlmONecYsFCvjtqkmMPDnXcVRb2JuHbPcDpB8OAGCvLt5eOElzqS1s+/IT1G+9PuqzG0vDKA7jmFIs24tnj/+ETiBirLOy/wiMZnpYqq3iWjo4f9pJuzO/Fhpn96W23t6WBo3pzzSnm3zBJIsb8dwb9oFUGz+rlrLrjJ+F8lOGAx1LDO8FW1sUfdXQokSTvx1HsyWZ/yjrfRIpJiOKac9uIPvnb+hic9xEejfh/ldU3YApydQwufosNXZKPC1ZXkxdZVkRKlYebWNFIf/La31jyvN+Ra46VhX1W+PF26bSyAgv7+Mc2zjTIGQsNv3WwsiIGeJHLu1FSZmUjK/zCn7TFjSWHrGCuOVYWvJAG5H9jGNx8eQUWzibBwxY+oyor5rGOJj4Il8bWDGDj/vKjHUUNpQahxDXntojXwdkTkEthCI1fWoGFPfkC/WxD6eqFhhlOVtaUqTpqYE9SdronG+XsR5ndG0gOZolrzh3BCiuekLq66mxDycIloh+pLJx7cB8x2zClyiLDs63HBKv6Ah1l9CUpVvJgdwp9qV5sfelkEOOaY2Uh331k4mzDcK8lhuuZ5SzkqIPVOWGRQfnayqo5gj/HeUwKrNOK5QzxpZCW9aQZcxjXnHKW3v9bw3tPF1e4L5wLw3V4qaqsqlc8yfuAXrK/25LJvj5kiaoplU4J4przImvJxeOChbpPOHPSYPEcw4/LFhvGdbKyLmR6Usw8vbQ9ryWLP9OGHOv8pT/n6881565gwRsCnsdgtcs9VsbCmbyffv1OxNGnoZVlbOlJ1W/7S5LTu+xmkhd1HXNKv6TEj2uOlYUzHJoPv3uBhTOMdWfOM8w5tLSM5eHTmtZfayOdSH2Hta+po/azzfq4jr5cc+6K9xF55ZVS51ZgoS4OzsLCJ9hn7/Iy1nL71jT993elag/fYeufaumjnvH6VYk+XHPuCp3AmZOLb8cbAo8tqcDCuW1+f8IXVmV9+q6WeugrSyO9mrLMWHf68ky03m2nD9eceziHbMa5x7j68w1ObssqsJK7Lk/F+xPBEg3pXY8I1m/vu9Og3MP6if3fZtlV3Smj33A9rQrimnMPtYPNOAOG90RpskL0b7D4O22GpwGun12VKDwVwJq4z43ua6L1UoEr61bZnaIabgyad1zimmNlIe8k/vQioXno32ChvhG/T+TXCBby58F6sExDPaf212feacL6921FO5MH7XNfGcg1pwT1dMw4JwzW7toJBj72/zufCDPDZ+PauQWG+aMSRT44WKcquZFTC3t9YUwLtnNIK9In39nnGBLINcfKwplfsAwxCYbUbw8L1kfrWpnhVwIW4oX8YrDm1HCjtpUr60+v1bC5Ia3o0uZApcYRf645JUauW2b4uIAF7120xRr7OmZ4dqgs5BeL8fGkhrbNXLSn9W4N25vUivI/HqqsaxbENafEiHpUr2LhrDliX616osgHF331hIaWPknYB5bi6k46jyFKv5/0XHPuY1/0lawZO1akQiPQduQXg3XmkIZ8DT6KlrOipvLn6PWZ0vBRENec+8bcvu+a4f+hshBjlcWfRSo8ktFXM0dbWSOHulGpbFIuerqzLk4elHJ6kHLNN5Brzn2spZlx1h5aABZiDFaBvpoZuU2XzcsMS75eKfIZwUoY7UbP4pjyh5s7k8mD6jWKVkpu+nDNuW/seyxY9EmMW2gLYgzWmS6PUu60XJsKX2PeVuFrJPS+phulD66haC5omP6oBwVnxikOkd5ccx6gRokZORPwVUb/Qp68yqq5aWMq+O2mrbDmgwtd1dCaNRplyyfN2NgiD6oyIU554zsvrjkP4NNshp/F+a0rDdEXfxAxBot/h6fwORT/flslPJeRgyjWAfa0pJC1g5SsxEZs2R4PihszX/FL9OSa8wDrcuYGR1enYpxVY/zv2lDKjY3bUzEvgBc18kXAGr+3JTmnxymhg11Y+w+01PudpUrBBzquOVbWLecNqZOWrhIs5Hn+OydPSduppMLzF/eL/Aew7D9uSZk345TgRk5s3xAteekSlGFh3lxz/jYOcGpi7mxJFv8PFnLbVRbvn6k4M4Q5E75HwTJX0dCW6J7KL+Oc2M2mWjp97wdlR1wg1xwri39XiP/XJf8g2gLWxUkpKX2PHRIszFnwTSK+kRM1FCR1V+rUdWJTPbXU4toapYEncc35G3u/5m1tdqfCmxMxQ/4FWHxOXYGF9Uesy93e5EZ7oscr5kWNWGU3La3utEkZ3oy45pRiHi3iAhbagtyAl7GwPvR49y5pft1W1KvvciVltYZFtNDSz/ImxbkRcc0pNaItiAtY8KJGXFSWy6JyFvbacF8TjrtTxKh1iuFsG3b1mQf1br5JGTOEcc0pxZw8hfd1weLvjPiGVVn83RQsXMc3JOLV67I7RW9LUNwa+rAc3lc/ykhSvqglcc0pRe2BFN6nBAv9EjFWWfzdFCzcL/ZMwWpdy53CbnyrtJygY86FHjR5Z5JyIRia8w/WfVP4e1PGQltUVuen5feFbziw/vi1FUUNi1N2vOPJKstaCh+SpFj+krnmWFkLqZyFfdbnY//AZ1UZa/rZVhTpGKecX+3JnjItlQxOUmp0I645VtbaKgfKWMgzeNlzVFnjPnAn35TpSkHjNmycg5aazk1SFmYwrjlW1o7T5Sx826rv9stYW066094e05WnC3yYWy0t9Vw0T7CaN38oWLLfwTJWNcnKwjN5GSv+mTt9YTddCT3oy7Jra+lmg1mCNWiQlYVn/19ZSY09KDcvVnm/v18FVvKmh0InbFnoR+q7/TLWry4eVHP9BOXR+35sfDXO+n6lYBUXvZr1/Lv9Mta0qlqqV2eNYPn4PHqBpfaJ51k4qyDm5I14/zw8QdH09GNFNbVU7LVG8clFvfJHL8TrZf3LlnWzoQf99GesYOVV11LbrUmClaL8d5b6PtqylvE+sSg1SZleyLjmPH6BpcbrVSydswd9cCRWxMuWFRLy+lizZr4+Vtqp18eqW/fJa4t9t26vj7V82atZz/fVl7HW1tFSc+Mawbp08dUsjE+2LFx/nuXjrKXdXRYrGUXQnKevjP3z+mUdhyrG/hL/BsmrG680qUpcc/47Cx6oz7MWa7R0qGm8MroWcc15faziov+PhXH7VSwfn2evjTVu3LP/K/bPs2xjn6K8PpadnV3w62I1b/76WP8DLwSufaQdAQA=';
      const expectedFrameCount = 962;
      const expectedRecordWidth = 19;
      const headerBytes = 12;
      const jointOrigins = [
        [[0.0388353, -8.97657e-9, 0.0624], [3.14159, 4.18253e-17, -3.14159]],
        [[-0.0303992, -0.0182778, -0.0542], [-1.5708, -1.5708, 0]],
        [[-0.11257, -0.028, 1.73763e-16], [-3.63608e-16, 8.74301e-16, 1.5708]],
        [[-0.1349, 0.0052, 3.62355e-17], [4.02456e-15, 8.67362e-16, -1.5708]],
        [[5.55112e-17, -0.0611, 0.0181], [1.5708, 0.0486795, 3.14159]],
        [[0.0202, 0.0188, -0.0234], [1.5708, -5.24284e-8, -1.41553e-15]]
      ];
      const wrapper = document.querySelector('#lerobot-episode-replay');
      const scene = wrapper.querySelector('#lerobot-replay-scene');
      const video = wrapper.querySelector('#lerobot-episode-video');
      const videoCaption = wrapper.querySelector('#lerobot-video-caption');
      const frameOutput = wrapper.querySelector('#lerobot-frame-time');
      const rangeOutput = wrapper.querySelector('#lerobot-range-output');
      const range = wrapper.querySelector('#lerobot-frame-range');
      const playPause = wrapper.querySelector('#lerobot-play-pause');
      const restart = wrapper.querySelector('#lerobot-restart');
      const announcer = wrapper.querySelector('#lerobot-announcer');
      const trail = wrapper.querySelector('#lerobot-observed-trail');
      const actionTarget = wrapper.querySelector('#lerobot-action-target');
      const actionArrow = wrapper.querySelector('#lerobot-action-arrow');
      const actionVector = wrapper.querySelector('#lerobot-action-vector');
      const frames = Array.from({ length: 6 }, (_, index) => wrapper.querySelector('#lerobot-joint-' + index));
      const stateCells = Array.from({ length: 6 }, (_, index) => wrapper.querySelector('#lerobot-state-' + index));
      const actionCells = Array.from({ length: 6 }, (_, index) => wrapper.querySelector('#lerobot-action-' + index));
      let episode;
      let currentFrame = 0;
      let playing = false;
      let animationFrame;
      let playbackOrigin = 0;
      let playbackStartedAt = 0;
      let lastPlaybackAnnouncement = Number.NEGATIVE_INFINITY;

      scene.ready.then(
        () => requestAnimationFrame(() => requestAnimationFrame(() => (wrapper.dataset.sceneReady = 'true'))),
        () => (wrapper.dataset.sceneReady = 'false')
      );

      function multiplyQuaternion(left, right) {
        return [
          left[3] * right[0] + left[0] * right[3] + left[1] * right[2] - left[2] * right[1],
          left[3] * right[1] - left[0] * right[2] + left[1] * right[3] + left[2] * right[0],
          left[3] * right[2] + left[0] * right[1] - left[1] * right[0] + left[2] * right[3],
          left[3] * right[3] - left[0] * right[0] - left[1] * right[1] - left[2] * right[2]
        ];
      }

      function normalizeQuaternion(quaternion) {
        const length = Math.hypot(...quaternion);
        return quaternion.map(value => value / length);
      }

      function rpyQuaternion(rpy) {
        const halfRoll = rpy[0] / 2;
        const halfPitch = rpy[1] / 2;
        const halfYaw = rpy[2] / 2;
        const roll = [Math.sin(halfRoll), 0, 0, Math.cos(halfRoll)];
        const pitch = [0, Math.sin(halfPitch), 0, Math.cos(halfPitch)];
        const yaw = [0, 0, Math.sin(halfYaw), Math.cos(halfYaw)];
        return multiplyQuaternion(multiplyQuaternion(yaw, pitch), roll);
      }

      function jointQuaternion(rpy, angle) {
        const halfAngle = angle / 2;
        const orientation = [0, 0, Math.sin(halfAngle), Math.cos(halfAngle)];
        return normalizeQuaternion(multiplyQuaternion(rpyQuaternion(rpy), orientation));
      }

      function value(frame, column) {
        return episode[frame * expectedRecordWidth + column];
      }

      function vector(frame, column) {
        return [value(frame, column), value(frame, column + 1), value(frame, column + 2)];
      }

      function scaledVector(frame, column) {
        return vector(frame, column).map(value => value * 10);
      }

      function vectorAttribute(values) {
        return values.map(value => value.toFixed(6)).join(' ');
      }

      function frameDescription(index) {
        return 'Frame ' + index + ' of 961, ' + value(index, 0).toFixed(3) + ' seconds';
      }

      function setPlaying(nextPlaying) {
        playing = nextPlaying;
        playPause.checked = !nextPlaying;
        if (!nextPlaying) video.pause();
        if (!nextPlaying && animationFrame !== undefined) {
          cancelAnimationFrame(animationFrame);
          animationFrame = undefined;
        }
      }

      function renderFrame(index, source, now = performance.now()) {
        currentFrame = Math.min(expectedFrameCount - 1, Math.max(0, Math.round(index)));
        frames.forEach((frame, jointIndex) => {
          const origin = jointOrigins[jointIndex];
          frame.setTransform({
            position: origin[0].map(value => value * 10),
            orientation: jointQuaternion(origin[1], value(currentFrame, jointIndex + 1))
          });
        });

        const observedTcp = scaledVector(currentFrame, 13);
        const commandedTcp = scaledVector(currentFrame, 16);
        const distance = Math.hypot(
          commandedTcp[0] - observedTcp[0],
          commandedTcp[1] - observedTcp[1],
          commandedTcp[2] - observedTcp[2]
        );
        actionTarget.position = vectorAttribute(commandedTcp);
        actionVector.from = vectorAttribute(observedTcp);
        actionVector.to = vectorAttribute(commandedTcp);
        actionArrow.hidden = distance < 1e-5;
        trail.count = currentFrame + 1;
        range.valueAsNumber = value(currentFrame, 0);
        rangeOutput.value = 'Frame ' + currentFrame;
        const rangeInput = range.shadowRoot?.querySelector('input');
        rangeInput?.setAttribute('aria-label', 'Episode playback position');
        rangeInput?.setAttribute('aria-valuetext', frameDescription(currentFrame));
        frameOutput.value = 'Frame ' + currentFrame + ' / 961 · ' + value(currentFrame, 0).toFixed(3) + ' / 32.033 s';
        stateCells.forEach((cell, jointIndex) => (cell.textContent = value(currentFrame, jointIndex + 1).toFixed(4)));
        actionCells.forEach((cell, jointIndex) => (cell.textContent = value(currentFrame, jointIndex + 7).toFixed(4)));
        wrapper.dataset.frame = String(currentFrame);
        wrapper.dataset.timestamp = value(currentFrame, 0).toFixed(6);
        wrapper.dataset.observedTcp = vectorAttribute(observedTcp);
        wrapper.dataset.actionTarget = vectorAttribute(commandedTcp);

        const timestamp = value(currentFrame, 0);
        if (video.readyState > 0 && (source !== 'playback' || Math.abs(video.currentTime - timestamp) > 0.15)) {
          video.currentTime = timestamp;
        }

        if (source === 'manual' || (source === 'playback' && now - lastPlaybackAnnouncement >= 1000)) {
          announcer.textContent = frameDescription(currentFrame);
          lastPlaybackAnnouncement = now;
        }
      }

      function nearestFrame(timestamp) {
        let low = 0;
        let high = expectedFrameCount - 1;
        while (low < high) {
          const middle = Math.floor((low + high) / 2);
          if (value(middle, 0) < timestamp) low = middle + 1;
          else high = middle;
        }
        if (low === 0) return 0;
        return timestamp - value(low - 1, 0) <= value(low, 0) - timestamp ? low - 1 : low;
      }

      function tick(now) {
        if (!playing || !wrapper.isConnected) {
          animationFrame = undefined;
          return;
        }
        const duration = value(expectedFrameCount - 1, 0);
        let targetTimestamp = playbackOrigin + (now - playbackStartedAt) / 1000;
        if (targetTimestamp > duration) {
          targetTimestamp %= duration;
          playbackOrigin = 0;
          playbackStartedAt = now - targetTimestamp * 1000;
        }
        renderFrame(nearestFrame(targetTimestamp), 'playback', now);
        animationFrame = requestAnimationFrame(tick);
      }

      function startPlayback() {
        if (playing) return;
        if (currentFrame === expectedFrameCount - 1) renderFrame(0, 'manual');
        setPlaying(true);
        playbackOrigin = value(currentFrame, 0);
        playbackStartedAt = performance.now();
        if (video.readyState > 0) {
          video.currentTime = playbackOrigin;
          video.play().catch(() => (wrapper.dataset.videoState = 'unavailable'));
        }
        animationFrame = requestAnimationFrame(tick);
      }

      function pausePlayback() {
        setPlaying(false);
      }

      function scrubToRange() {
        pausePlayback();
        renderFrame(nearestFrame(range.valueAsNumber), 'manual');
      }

      range.addEventListener('pointerdown', pausePlayback);
      range.addEventListener('keydown', pausePlayback);
      range.addEventListener('input', scrubToRange);
      range.addEventListener('change', scrubToRange);
      playPause.addEventListener('click', () => (playPause.checked ? pausePlayback() : startPlayback()));
      restart.addEventListener('click', () => {
        pausePlayback();
        renderFrame(0, 'manual');
      });
      video.addEventListener('loadedmetadata', () => {
        wrapper.dataset.videoState = 'ready';
        if (episode) {
          video.currentTime = value(currentFrame, 0);
          if (playing) video.play().catch(() => (wrapper.dataset.videoState = 'unavailable'));
        }
      });
      video.addEventListener('error', () => {
        wrapper.dataset.videoState = 'unavailable';
        videoCaption.textContent = 'Top camera unavailable · the data replay remains interactive';
      });

      async function decodeEpisode() {
        if (!('DecompressionStream' in globalThis)) throw new Error('Gzip decompression is unavailable.');
        const compressed = Uint8Array.from(atob(encodedEpisode), character => character.charCodeAt(0));
        const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
        const buffer = await new Response(stream).arrayBuffer();
        const expectedBytes = headerBytes + expectedFrameCount * expectedRecordWidth * Float32Array.BYTES_PER_ELEMENT;
        if (buffer.byteLength !== expectedBytes) throw new Error('Unexpected episode byte length.');
        const view = new DataView(buffer);
        if (view.getUint8(0) !== 76 || view.getUint8(1) !== 82 || view.getUint8(2) !== 69 || view.getUint8(3) !== 49) {
          throw new Error('Unexpected episode magic.');
        }
        if (view.getUint32(4, true) !== expectedFrameCount) throw new Error('Unexpected episode frame count.');
        if (view.getUint32(8, true) !== expectedRecordWidth) throw new Error('Unexpected episode record width.');
        const values = new Float32Array(expectedFrameCount * expectedRecordWidth);
        for (let index = 0; index < values.length; index += 1) {
          const nextValue = view.getFloat32(headerBytes + index * Float32Array.BYTES_PER_ELEMENT, true);
          if (!Number.isFinite(nextValue)) throw new Error('Episode contains a non-finite value.');
          values[index] = nextValue;
        }
        return values;
      }

      try {
        episode = await decodeEpisode();
        const trailBytes = new Uint8Array(expectedFrameCount * LINE_VERTEX.stride);
        for (let index = 0; index < expectedFrameCount; index += 1) {
          writeLineVertex(trailBytes, index, {
            position: scaledVector(index, 13),
            color: [0.49, 0.83, 0.99, 1],
            width: 3
          });
        }
        trail.vertices = trailBytes;
        wrapper.dataset.frameCount = String(expectedFrameCount);
        wrapper.dataset.duration = value(expectedFrameCount - 1, 0).toFixed(6);
        const startFrame = Math.min(961, Math.max(0, Number.parseInt(wrapper.dataset.startFrame || '0', 10) || 0));
        renderFrame(startFrame, 'manual');
        range.disabled = false;
        playPause.disabled = false;
        restart.disabled = false;
        wrapper.dataset.replayReady = 'true';
        const shouldAutoplay = wrapper.dataset.autoplay === 'true';
        if (shouldAutoplay) startPlayback();
      } catch (error) {
        pausePlayback();
        wrapper.dataset.replayError = 'true';
        frameOutput.value = 'Episode data unavailable';
        console.error('Unable to decode the bundled LeRobot episode.', error);
      }
    </script>
  `
};
