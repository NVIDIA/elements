// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/lines/define.js';
import '@nvidia-elements/scene/body/define.js';
import '@nvidia-elements/scene/mesh/define.js';

export default {
  title: 'Elements/Scene/Body',
  component: 'nve-scene-body'
};

/**
 * @summary Build a rover from primitive shapes. Use declarative geometry to adjust shapes, transforms, and colors directly in HTML.
 */
export const Default = {
  render: () => html`
    <nve-scene id="robot-rover-scene" aria-label="robot rover body" style="height: 100%">
      <nve-scene-gridlines count="12" spacing="2"></nve-scene-gridlines>
      <nve-scene-camera behavior="orbit" target="[0,0,1]" distance="8" polar-angle="0.9" azimuth="-0.75"></nve-scene-camera>
      <nve-scene-body aria-label="rover body">
        <nve-scene-shape type="cube" position="[0,0,0.68]" scale="[1.9,1.3,0.5]" color="#76b900"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0.35,0,1.04]" scale="[0.7,1,0.22]" color="#76b900"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[-0.55,0,1.38]" scale="[0.1,0.1,0.9]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[-0.55,0,1.91]" scale="[0.22,0.34,0.16]" color="#e0a53e"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[0.7,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[0.7,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[0,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[0,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[-0.7,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[-0.7,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
      </nve-scene-body>
    </nve-scene>
  `
};

/**
 * @summary Load the rover from an STL file as a mesh part of the body. Use tint to color imported geometry while preserving its coordinates and units.
 */
export const LoadGeometry = {
  render: () => html`
    <nve-scene aria-label="STL rover body" style="height: 100%">
      <nve-scene-gridlines count="12" spacing="2"></nve-scene-gridlines>
      <nve-scene-camera behavior="orbit" target="[0,0,1]" distance="8" polar-angle="0.9" azimuth="-0.75"></nve-scene-camera>
      <nve-scene-body tint="#959595" aria-label="Rover body">
        <nve-scene-mesh src="/static/models/rover.stl"></nve-scene-mesh>
      </nve-scene-body>
    </nve-scene>
  `
};

/**
 * @summary Place three rovers with different positions, rotations, and scales from one MarkerBuffer. Use packed instance records to reuse authored geometry across repeated assets.
 */
export const BufferSource = {
  render: () => html`
    <nve-scene aria-label="three buffered rover bodies" style="height: 100%">
      <nve-scene-gridlines count="12" spacing="2"></nve-scene-gridlines>
      <nve-scene-camera behavior="orbit" target="[0,0,1]" distance="13" polar-angle="0.9" azimuth="-0.75"></nve-scene-camera>
      <nve-scene-body id="buffered-rover" aria-label="three rover instances">
        <nve-scene-shape type="cube" position="[0,0,0.68]" scale="[1.9,1.3,0.5]" color="#76b900"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0.35,0,1.04]" scale="[0.7,1,0.22]" color="#76b900"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[-0.55,0,1.38]" scale="[0.1,0.1,0.9]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[-0.55,0,1.91]" scale="[0.22,0.34,0.16]" color="#e0a53e"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[0.7,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[0.7,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[0,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[0,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[-0.7,0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
        <nve-scene-shape type="cylinder" position="[-0.7,-0.77,0.34]" scale="[0.68,0.68,0.24]" orientation="[0.7071,0,0,0.7071]" color="#343946"></nve-scene-shape>
      </nve-scene-body>
    </nve-scene>
    <script type="module">
      import { MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/body/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const markers = new MarkerBuffer({ capacity: 3 });
      markers.add({ position: [-3, 0, 0] });
      markers.add({
        position: [0, 0, 0],
        orientation: [0, 0, 0.382683, 0.92388],
        scale: [0.75, 0.75, 0.75]
      });
      markers.add({
        position: [3, 0, 0],
        orientation: [0, 0, -0.258819, 0.965926],
        scale: [1.15, 1.15, 1.15]
      });
      document.querySelector('#buffered-rover').source = markers;
    </script>
  `
};

/**
 * @summary A compound traffic light body with controls for selecting the active signal. Use this pattern to show how user input can update individual shapes of an interactive scene body.
 */
export const TrafficLight = {
  render: () => html`
    <div id="traffic-light-demo" style="position: relative; height: 100%; width: 100%;">
      <nve-scene>
        <nve-scene-gridlines spacing="0.25" count="20"></nve-scene-gridlines>
        <nve-scene-camera behavior="orbit" projection="perspective" target="[0,0,0.8]" distance="3" polar-angle="1.15" azimuth="-0.35" min-distance="1.75" max-distance="6"></nve-scene-camera>
        <nve-scene-body id="traffic-light" aria-label="traffic light">
          <nve-scene-shape type="cube" position="[0,0,0.8]" scale="[0.8,0.42,1.5]" color="#252a33"></nve-scene-shape>
          <nve-scene-shape id="traffic-light-red" type="sphere" position="[0,-0.25,1.27]" scale="[0.4,0.2,0.4]" color="#ff453a"></nve-scene-shape>
          <nve-scene-shape id="traffic-light-yellow" type="sphere" position="[0,-0.25,0.8]" scale="[0.4,0.2,0.4]" color="#4a3d12"></nve-scene-shape>
          <nve-scene-shape id="traffic-light-green" type="sphere" position="[0,-0.25,0.33]" scale="[0.4,0.2,0.4]" color="#153d24"></nve-scene-shape>
        </nve-scene-body>
      </nve-scene>
      <nve-button-group id="traffic-light-buttons" style="position: absolute; inset-block-start: 16px; inset-inline-start: 16px;" behavior-select="single" container="rounded">
        <nve-button type="button" data-light="red" pressed>red</nve-button>
        <nve-button type="button" data-light="yellow">yellow</nve-button>
        <nve-button type="button" data-light="green">green</nve-button>
      </nve-button-group>
    </div>
    <script type="module">\
      const shapes = document.querySelectorAll('#traffic-light > nve-scene-shape');
      const lights = {
        red: {
          shape: shapes[1],
          active: '#ff453a',
          inactive: '#4a1717'
        },
        yellow: {
          shape: shapes[2],
          active: '#ffd60a',
          inactive: '#4a3d12'
        },
        green: {
          shape: shapes[3],
          active: '#30d158',
          inactive: '#153d24'
        }
      };

      document.querySelectorAll('#traffic-light-demo [data-light]').forEach(button => {
        button.addEventListener('click', () => {
          Object.entries(lights).forEach(([name, light]) => {
            light.shape.color = lights[name][name === button.dataset.light ? 'active' : 'inactive'];
          });
        });
      });
    </script>
  `
};

/**
 * @summary A high-angle signalized intersection combines streamed road lines, instanced polygon markings, and reusable traffic-light bodies. Use this pattern for map-based layouts that need clear markings, directions, and repeated scene assets.
 */
export const Intersection = {
  render: () => html`
    <nve-scene id="intersection-scene" aria-label="signalized four-way intersection with lane markings, directional arrows, crosswalks, and traffic lights" style="height: 100%; background: black">
      <nve-scene-camera behavior="orbit" projection="perspective" target="[0,0,0]" distance="48" polar-angle="0.55" azimuth="-0.15" vertical-field-of-view="0.86" min-distance="14" max-distance="90"></nve-scene-camera>
      <nve-scene-lines id="intersection-lanes" topology="segments"></nve-scene-lines>
      <nve-scene-lines id="intersection-dividers" topology="segments"></nve-scene-lines>
      <nve-scene-polygon id="intersection-crosswalks" color="rgb(219 230 242)" geometry='{"outer":[[-0.21,-0.4],[0.21,-0.4],[0.21,0.4],[-0.21,0.4]]}'></nve-scene-polygon>
      <nve-scene-polygon id="intersection-straight-arrows" color="rgb(219 230 242)" geometry='{"outer":[[-0.1,-1.05],[0.1,-1.05],[0.1,0.6],[0.32,0.6],[0,1.05],[-0.32,0.6],[-0.1,0.6]]}'></nve-scene-polygon>
      <nve-scene-polygon id="intersection-left-arrows" color="rgb(219 230 242)" geometry='{"outer":[[-0.1,-1],[0.1,-1],[0.1,0.45],[-0.75,0.45],[-0.75,0.65],[-1.2,0.35],[-0.75,0.05],[-0.75,0.25],[-0.1,0.25]]}'></nve-scene-polygon>
      <nve-scene-body id="intersection-traffic-lights" aria-label="twelve traffic light instances" source='[{"position":[-1.4,6.1,3.64],"orientation":[0,0,0,1],"scale":[0.85,0.85,0.85]},{"position":[1.4,6.1,3.64],"orientation":[0,0,0,1],"scale":[0.85,0.85,0.85]},{"position":[-7.2,-2.6,3.64],"orientation":[0,0,0.707107,0.707107],"scale":[0.85,0.85,0.85]},{"position":[-7.2,0,3.64],"orientation":[0,0,0.707107,0.707107],"scale":[0.85,0.85,0.85]},{"position":[-7.2,2.6,3.64],"orientation":[0,0,0.707107,0.707107],"scale":[0.85,0.85,0.85]},{"position":[7.2,-2.6,3.64],"orientation":[0,0,-0.707107,0.707107],"scale":[0.85,0.85,0.85]},{"position":[7.2,0,3.64],"orientation":[0,0,-0.707107,0.707107],"scale":[0.85,0.85,0.85]},{"position":[7.2,2.6,3.64],"orientation":[0,0,-0.707107,0.707107],"scale":[0.85,0.85,0.85]},{"position":[-4.5,-6.5,3.64],"orientation":[0,0,1,0],"scale":[0.85,0.85,0.85]},{"position":[-1.5,-6.5,3.64],"orientation":[0,0,1,0],"scale":[0.85,0.85,0.85]},{"position":[1.5,-6.5,3.64],"orientation":[0,0,1,0],"scale":[0.85,0.85,0.85]},{"position":[4.5,-6.5,3.64],"orientation":[0,0,1,0],"scale":[0.85,0.85,0.85]}]'>
        <nve-scene-shape type="cube" scale="[0.8,0.42,1.5]" color="#252a33"></nve-scene-shape>
        <nve-scene-shape type="sphere" position="[0,-0.25,0.47]" scale="[0.4,0.2,0.4]" color="#ff453a"></nve-scene-shape>
        <nve-scene-shape type="sphere" position="[0,-0.25,0]" scale="[0.4,0.2,0.4]" color="#4a3d12"></nve-scene-shape>
        <nve-scene-shape type="sphere" position="[0,-0.25,-0.47]" scale="[0.4,0.2,0.4]" color="#153d24"></nve-scene-shape>
      </nve-scene-body>
    </nve-scene>
    <script type="module">
      import { MarkerBuffer } from '@nvidia-elements/scene';
      import { LineVertexBuffer } from '@nvidia-elements/scene/lines';
      import '@nvidia-elements/scene/lines/define.js';
      import '@nvidia-elements/scene/polygon/define.js';

      await Promise.all([
        customElements.whenDefined('nve-scene-lines'),
        customElements.whenDefined('nve-scene-polygon')
      ]);
      const scene = document.querySelector('#intersection-scene');
      const white = [0.86, 0.9, 0.95, 1];
      const edge = [0.58, 0.65, 0.74, 0.9];
      const yellow = [0.95, 0.72, 0.12, 1];

      const addSegment = (segments, start, end, style = {}) => {
        segments.push({ start, end, ...style });
      };

      const setSegments = (id, segments, z) => {
        const vertices = new LineVertexBuffer({ capacity: segments.length * 2 });
        segments.forEach((segment, index) => {
          const style = {
            color: segment.color ?? white,
            width: segment.width ?? 0.12,
            dash: segment.dash ?? 0,
            gap: segment.gap ?? 0
          };
          vertices.set(index * 2, { position: [segment.start[0], segment.start[1], z], ...style });
          vertices.set(index * 2 + 1, { position: [segment.end[0], segment.end[1], z], ...style });
        });
        scene.querySelector('#' + id).source = vertices;
      };

      const laneSegments = [];
      [
        [[-28, -5.4], [-7.5, -5.4]],
        [[7.5, -5.4], [28, -5.4]],
        [[-28, 5.4], [-7.5, 5.4]],
        [[7.5, 5.4], [28, 5.4]],
        [[-6, -22], [-6, -8]],
        [[6, -22], [6, -8]],
        [[-4.5, 8], [-4.5, 22]],
        [[4.5, 8], [4.5, 22]],
        [[-7.5, -5.4], [-6, -8]],
        [[7.5, -5.4], [6, -8]],
        [[-7.5, 5.4], [-4.5, 8]],
        [[7.5, 5.4], [4.5, 8]]
      ].forEach(([start, end]) => addSegment(laneSegments, start, end, { color: edge, width: 0.16 }));

      [-3.6, -1.8, 1.8, 3.6].forEach(y => {
        addSegment(laneSegments, [-28, y], [-8, y], { dash: 0.9, gap: 0.65 });
        addSegment(laneSegments, [8, y], [28, y], { dash: 0.9, gap: 0.65 });
      });
      [-2.25, 2.25].forEach(x => addSegment(laneSegments, [x, 8], [x, 22], { dash: 0.9, gap: 0.65 }));
      [-4, -2, 2, 4].forEach(x => addSegment(laneSegments, [x, -22], [x, -8], { dash: 0.9, gap: 0.65 }));

      addSegment(laneSegments, [-7.8, -5.1], [-7.8, -0.3], { width: 0.28 });
      addSegment(laneSegments, [7.8, 0.3], [7.8, 5.1], { width: 0.28 });
      addSegment(laneSegments, [-4.2, 7.8], [-0.3, 7.8], { width: 0.28 });
      addSegment(laneSegments, [0.3, -7.8], [5.7, -7.8], { width: 0.28 });
      setSegments('intersection-lanes', laneSegments, 0.03);

      const dividerSegments = [];
      [-0.14, 0.14].forEach(y => {
        addSegment(dividerSegments, [-28, y], [-8, y], { color: yellow, width: 0.1 });
        addSegment(dividerSegments, [8, y], [28, y], { color: yellow, width: 0.1 });
      });
      [-0.14, 0.14].forEach(x => {
        addSegment(dividerSegments, [x, 8], [x, 22], { color: yellow, width: 0.1 });
        addSegment(dividerSegments, [x, -22], [x, -8], { color: yellow, width: 0.1 });
      });
      setSegments('intersection-dividers', dividerSegments, 0.035);

      const crosswalks = new MarkerBuffer({ capacity: 44 });
      for (let index = 0; index < 11; index += 1) {
        const northX = -4 + index * 0.8;
        const southX = -5 + index;
        const sideY = -4.5 + index * 0.9;
        crosswalks.set(index * 4, { position: [northX, 6.85, 0.04] });
        crosswalks.set(index * 4 + 1, { position: [southX, -6.85, 0.04] });
        crosswalks.set(index * 4 + 2, { position: [-6.85, sideY, 0.04], orientation: [0, 0, 0.707107, 0.707107] });
        crosswalks.set(index * 4 + 3, { position: [6.85, sideY, 0.04], orientation: [0, 0, 0.707107, 0.707107] });
      }
      scene.querySelector('#intersection-crosswalks').source = crosswalks;

      const orientation = forward => {
        if (forward[0] === 1) return [0, 0, -0.707107, 0.707107];
        if (forward[0] === -1) return [0, 0, 0.707107, 0.707107];
        if (forward[1] === -1) return [0, 0, 1, 0];
        return [0, 0, 0, 1];
      };
      const straightData = [
        [[-14, -4.45], [1, 0]],
        [[-14, -2.65], [1, 0]],
        [[14, 4.45], [-1, 0]],
        [[14, 2.65], [-1, 0]],
        [[-3.25, 13], [0, -1]],
        [[3, -13], [0, 1]],
        [[5, -13], [0, 1]]
      ];
      const leftData = [
        [[-12, -0.9], [1, 0]],
        [[12, 0.9], [-1, 0]],
        [[-1.25, 12], [0, -1]],
        [[1.1, -12], [0, 1]]
      ];
      const createArrowMarkers = data => {
        const markers = new MarkerBuffer({ capacity: data.length });
        data.forEach(([position, forward], index) => markers.set(index, {
          position: [position[0], position[1], 0.055],
          orientation: orientation(forward)
        }));
        return markers;
      };
      scene.querySelector('#intersection-straight-arrows').source = createArrowMarkers(straightData);
      scene.querySelector('#intersection-left-arrows').source = createArrowMarkers(leftData);
    </script>
  `
};

/**
 * @summary A scale-proportioned server rack combines repeated compute, NVLink, power, cooling, and cable shapes in one compound body. Use this pattern to visualize detailed rack-scale infrastructure while keeping the scene stateless and orbitable.
 */
export const ServerRack = {
  render: () => html`
    <nve-scene aria-label="NVIDIA server" style="height: 100%">
      <nve-scene-gridlines spacing="0.25" count="16"></nve-scene-gridlines>
      <nve-scene-camera behavior="orbit" projection="perspective" target="[0,0,1.1]" distance="3.35" polar-angle="1.16" azimuth="-1.15" vertical-field-of-view="0.785398163" min-distance="1.8" max-distance="8"></nve-scene-camera>
      <nve-scene-body aria-label="NVIDIA compute rack">
        <!-- 600 × 1,068 × 2,236 mm rack -->
        <nve-scene-shape type="cube" position="[0,0,1.118]" scale="[0.6,1.068,2.236]" color="#16191f"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0,-0.546,1.12]" scale="[0.522,0.04,2.08]" color="#090b0e"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[-0.282,-0.57,1.118]" scale="[0.036,0.08,2.18]" color="#353b46"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0.282,-0.57,1.118]" scale="[0.036,0.08,2.18]" color="#353b46"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0,-0.57,0.046]" scale="[0.6,0.08,0.07]" color="#353b46"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0,-0.57,2.19]" scale="[0.6,0.08,0.07]" color="#353b46"></nve-scene-shape>

        <!-- eight power shelves with six front-facing power supply units -->
        ${Array.from({ length: 8 }, (_, shelfIndex) => {
          const z = 0.14 + shelfIndex * 0.055;
          return html`
            <nve-scene-shape type="cube" position="[0,-0.586,${z}]" scale="[0.494,0.072,0.049]" color="#282d35"></nve-scene-shape>
            ${Array.from({ length: 6 }, (_, moduleIndex) => {
              const x = -0.2 + moduleIndex * 0.08;
              return html`
              <nve-scene-shape type="cube" position="[${x},-0.627,${z}]" scale="[0.064,0.014,0.03]" color="#59616f"></nve-scene-shape>
              <nve-scene-shape type="cube" position="[${x + 0.024},-0.636,${z}]" scale="[0.007,0.006,0.007]" color="#76b900"></nve-scene-shape>`;
            })}
          `;
        })}

        <!-- nine groups of two compute trays and one nvlink switch tray -->
        ${Array.from({ length: 9 }, (_, groupIndex) => {
          const groupBase = 0.63 + groupIndex * 0.158;
          return html`${Array.from({ length: 2 }, (_, trayIndex) => {
            const z = groupBase + trayIndex * 0.052;
            return html`
              <nve-scene-shape type="cube" position="[0,-0.588,${z}]" scale="[0.494,0.076,0.046]" color="#4f493d"></nve-scene-shape>
              <nve-scene-shape type="cube" position="[0,-0.63,${z}]" scale="[0.47,0.012,0.032]" color="#181b20"></nve-scene-shape>
              ${[-0.176, -0.059, 0.059, 0.176].map(
                x => html`
              <nve-scene-shape type="cube" position="[${x},-0.64,${z}]" scale="[0.092,0.01,0.024]" color="#b69358"></nve-scene-shape>
              <nve-scene-shape type="cube" position="[${x},-0.646,${z}]" scale="[0.006,0.006,0.03]" color="#d3b77c"></nve-scene-shape>`
              )}
              <nve-scene-shape type="cube" position="[0.226,-0.646,${z}]" scale="[0.009,0.006,0.009]" color="#76b900"></nve-scene-shape>`;
          })}
            <nve-scene-shape type="cube" position="[0,-0.588,${groupBase + 0.104}]" scale="[0.494,0.076,0.046]" color="#252a33"></nve-scene-shape>
            <nve-scene-shape type="cube" position="[0,-0.631,${groupBase + 0.104}]" scale="[0.47,0.012,0.03]" color="#39404e"></nve-scene-shape>
          `;
        })}

        <!-- management switches. -->
        <nve-scene-shape type="cube" position="[-0.128,-0.588,2.075]" scale="[0.238,0.076,0.052]" color="#303641"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0.128,-0.588,2.075]" scale="[0.238,0.076,0.052]" color="#303641"></nve-scene-shape>
        ${Array.from({ length: 12 }, (_, portIndex) => html`<nve-scene-shape type="cube" position="[${-0.218 + portIndex * 0.0396},-0.632,2.075]" scale="[0.024,0.012,0.016]" color="#8f97a6"></nve-scene-shape>`)}
      </nve-scene-body>
    </nve-scene>
  `
};

/**
 * @summary A twelve-rack cluster instances one compound server body across parallel rows with a shared orientation. Use this pattern for efficient data center layouts where repeated detailed assets should share geometry.
 */
export const DataCenter = {
  render: () => html`
    <nve-scene aria-label="small supercomputer cluster with twelve server racks" style="height: 100%">
      <nve-scene-gridlines spacing="0.5" count="18"></nve-scene-gridlines>
      <nve-scene-camera
        behavior="orbit"
        projection="perspective"
        target="[0,0,1.1]"
        distance="8.5"
        polar-angle="0.82"
        azimuth="-0.75"
        vertical-field-of-view="0.785398163"
        min-distance="4"
        max-distance="16"
      ></nve-scene-camera>
      <nve-scene-body
        aria-label="twelve instanced NVIDIA compute racks"
        source=${JSON.stringify(
          [-1.95, -1.17, -0.39, 0.39, 1.17, 1.95].flatMap(x => [
            { position: [x, 1.35, 0] },
            { position: [x, -1.35, 0] }
          ])
        )}
      >
        <!-- 600 × 1,068 × 2,236 mm rack -->
        <nve-scene-shape type="cube" position="[0,0,1.118]" scale="[0.6,1.068,2.236]" color="#16191f"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0,-0.546,1.12]" scale="[0.522,0.04,2.08]" color="#090b0e"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[-0.282,-0.57,1.118]" scale="[0.036,0.08,2.18]" color="#353b46"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0.282,-0.57,1.118]" scale="[0.036,0.08,2.18]" color="#353b46"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0,-0.57,0.046]" scale="[0.6,0.08,0.07]" color="#353b46"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0,-0.57,2.19]" scale="[0.6,0.08,0.07]" color="#353b46"></nve-scene-shape>

        <!-- eight power shelves with six front-facing power supply units -->
        ${Array.from({ length: 8 }, (_, shelfIndex) => {
          const z = 0.14 + shelfIndex * 0.055;
          return html`
            <nve-scene-shape type="cube" position="[0,-0.586,${z}]" scale="[0.494,0.072,0.049]" color="#282d35"></nve-scene-shape>
            ${Array.from({ length: 6 }, (_, moduleIndex) => {
              const x = -0.2 + moduleIndex * 0.08;
              return html`
                <nve-scene-shape type="cube" position="[${x},-0.627,${z}]" scale="[0.064,0.014,0.03]" color="#59616f"></nve-scene-shape>
                <nve-scene-shape type="cube" position="[${x + 0.024},-0.636,${z}]" scale="[0.007,0.006,0.007]" color="#76b900"></nve-scene-shape>
              `;
            })}
          `;
        })}

        <!-- nine groups of two compute trays and one NVLink switch tray -->
        ${Array.from({ length: 9 }, (_, groupIndex) => {
          const groupBase = 0.63 + groupIndex * 0.158;
          return html`
            ${Array.from({ length: 2 }, (_, trayIndex) => {
              const z = groupBase + trayIndex * 0.052;
              return html`
                <nve-scene-shape type="cube" position="[0,-0.588,${z}]" scale="[0.494,0.076,0.046]" color="#4f493d"></nve-scene-shape>
                <nve-scene-shape type="cube" position="[0,-0.63,${z}]" scale="[0.47,0.012,0.032]" color="#181b20"></nve-scene-shape>
                ${[-0.176, -0.059, 0.059, 0.176].map(
                  x => html`
                    <nve-scene-shape type="cube" position="[${x},-0.64,${z}]" scale="[0.092,0.01,0.024]" color="#b69358"></nve-scene-shape>
                    <nve-scene-shape type="cube" position="[${x},-0.646,${z}]" scale="[0.006,0.006,0.03]" color="#d3b77c"></nve-scene-shape>
                  `
                )}
                <nve-scene-shape type="cube" position="[0.226,-0.646,${z}]" scale="[0.009,0.006,0.009]" color="#76b900"></nve-scene-shape>
              `;
            })}
            <nve-scene-shape type="cube" position="[0,-0.588,${groupBase + 0.104}]" scale="[0.494,0.076,0.046]" color="#252a33"></nve-scene-shape>
            <nve-scene-shape type="cube" position="[0,-0.631,${groupBase + 0.104}]" scale="[0.47,0.012,0.03]" color="#39404e"></nve-scene-shape>
          `;
        })}

        <!-- management switches -->
        <nve-scene-shape type="cube" position="[-0.128,-0.588,2.075]" scale="[0.238,0.076,0.052]" color="#303641"></nve-scene-shape>
        <nve-scene-shape type="cube" position="[0.128,-0.588,2.075]" scale="[0.238,0.076,0.052]" color="#303641"></nve-scene-shape>
        ${Array.from(
          { length: 12 },
          (_, portIndex) => html`
            <nve-scene-shape type="cube" position="[${-0.218 + portIndex * 0.0396},-0.632,2.075]" scale="[0.024,0.012,0.016]" color="#8f97a6"></nve-scene-shape>
          `
        )}

      </nve-scene-body>
    </nve-scene>
  `
};
