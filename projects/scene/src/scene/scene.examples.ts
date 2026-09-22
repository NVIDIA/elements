// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/toggletip/define.js';
import '@nvidia-elements/scene/arrows/define.js';
import '@nvidia-elements/scene/axes/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/cones/define.js';
import '@nvidia-elements/scene/cubes/define.js';
import '@nvidia-elements/scene/cylinders/define.js';
import '@nvidia-elements/scene/frame/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/heightfield/define.js';
import '@nvidia-elements/scene/labels/define.js';
import '@nvidia-elements/scene/lines/define.js';
import '@nvidia-elements/scene/mesh/define.js';
import '@nvidia-elements/scene/model/define.js';
import '@nvidia-elements/scene/points/define.js';
import '@nvidia-elements/scene/polygon/define.js';
import '@nvidia-elements/scene/pyramids/define.js';
import '@nvidia-elements/scene/scene/define.js';
import '@nvidia-elements/scene/spheres/define.js';
import '@nvidia-elements/scene/triangles/define.js';

export default {
  title: 'Elements/Scene',
  component: 'nve-scene'
};

/**
 * @summary Simple scene with a single cube instance and gridlines.
 */
export const InstallSource = {
  render: () => html`
    <script type="module">
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/cubes/define.js';
    </script>
    <nve-scene aria-label="simple scene">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes source='[{"position":[-2.5,0,0.375],"size":[0.75,0.75,0.75],"color":"cyan"},{"position":[0,0,0.5],"size":[1,1,1],"color":"magenta"},{"position":[2.5,0,0.75],"size":[1.5,1.5,1.5],"color":"yellow"}]'>
      </nve-scene-cubes>
    </nve-scene>
  `
};

/**
 * @summary Combines reference geometry, a directional arrow, opaque and outlined translucent primitives, streamed data, terrain, a mesh, a compound model, and a vector label. Use this scene as a compact starting point for exploring each major Scene component.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="scene component showcase">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="12"></nve-scene-camera>
      <nve-scene-gridlines count="14"></nve-scene-gridlines>
      <nve-scene-axes length="3"></nve-scene-axes>

      <nve-scene-cubes source='[{"position":[-5,2.5,0.5],"color":"cyan"}]'>
      </nve-scene-cubes>
      <nve-scene-spheres source='[{"position":[-3,2.5,0.5],"color":"magenta"}]'>
      </nve-scene-spheres>
      <nve-scene-cylinders source='[{"position":[-1,2.5,0.75],"size":[0.75,0.75,1.5],"color":"yellow"}]'>
      </nve-scene-cylinders>
      <nve-scene-cones source='[{"position":[1,2.5,0.75],"size":[0.75,0.75,1.5],"color":"cyan"}]'>
      </nve-scene-cones>
      <nve-scene-pyramids source='[{"position":[3,2.5,0.75],"size":[0.75,0.75,1.5],"color":"magenta"}]'>
      </nve-scene-pyramids>
      <nve-scene-frame position="[5,2.5,0]">
        <nve-scene-labels id="basic-labels"></nve-scene-labels>
        <nve-scene-model>
          <nve-scene-part shape="cube" position="[0,0,0.6]" scale="[1.4,0.9,0.5]" color="yellow"></nve-scene-part>
          <nve-scene-part shape="cylinder" position="[0,0,1.3]" scale="[0.2,0.2,0.9]" color="yellow"></nve-scene-part>
        </nve-scene-model>
      </nve-scene-frame>

      <nve-scene-cubes source='[{"position":[-4,0,0.5],"color":"rgba(0,255,255,0.2)","outlineColor":"cyan"},{"position":[-3.6,0.2,0.5],"color":"rgba(255,255,0,0.2)","outlineColor":"yellow"},{"position":[-4.4,-0.2,0.5],"color":"rgba(255,0,255,0.2)","outlineColor":"magenta"}]'>
      </nve-scene-cubes>
      <nve-scene-arrows
        source='[{"origin":[-1.8,-0.4,0],"vector":[1,0.5,1.5],"shaftDiameter":0.1,"color":"yellow"}]'
      ></nve-scene-arrows>

      <nve-scene-polygon color="cyan" geometry='{"outer":[[-0.25,-1.2],[0.25,-1.2],[0.25,0],[0.8,0],[0,1.2],[-0.8,0],[-0.25,0]]}' source='[{"position":[4.2,0,0.05],"scale":[0.4,0.4,1]}]'>
      </nve-scene-polygon>
      <nve-scene-polygon color="magenta" geometry='{"outer":[[-0.5,-1.2],[0.5,-1.2],[1.2,-0.5],[1.2,0.5],[0.5,1.2],[-0.5,1.2],[-1.2,0.5],[-1.2,-0.5]],"holes":[[[-0.35,-0.35],[-0.35,0.35],[0.35,0.35],[0.35,-0.35]]]}' source='[{"position":[5.3,0,0.05],"scale":[0.4,0.4,1]}]'>
      </nve-scene-polygon>
      <nve-scene-polygon color="yellow" geometry='{"outer":[[-0.8,-1.2],[0.8,-1.2],[0.8,-0.6],[0.3,-0.6],[0.3,1.2],[-0.3,1.2],[-0.3,-0.6],[-0.8,-0.6]]}' source='[{"position":[6.4,0,0.05],"scale":[0.4,0.4,1]}]'>
      </nve-scene-polygon>

      <nve-scene-frame position="[-5,-3,0]">
        <nve-scene-heightfield id="basic-terrain" color="magenta"></nve-scene-heightfield>
      </nve-scene-frame>
      <nve-scene-mesh id="basic-mesh" color="yellow" source='[{"position":[-1.5,-3,0.6]}]'>
      </nve-scene-mesh>

      <nve-scene-points id="basic-points" size="7"></nve-scene-points>
      <nve-scene-lines id="basic-line"></nve-scene-lines>
      <nve-scene-triangles id="basic-triangle"></nve-scene-triangles>
    </nve-scene>
    <script type="module">
      import { LabelBuffer } from '@nvidia-elements/scene/labels';
      import { LineVertexBuffer } from '@nvidia-elements/scene/lines';
      import { PointBuffer } from '@nvidia-elements/scene/points';
      import { TriangleVertexBuffer } from '@nvidia-elements/scene/triangles';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/arrows/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/cubes/define.js';
      import '@nvidia-elements/scene/spheres/define.js';
      import '@nvidia-elements/scene/cylinders/define.js';
      import '@nvidia-elements/scene/cones/define.js';
      import '@nvidia-elements/scene/pyramids/define.js';
      import '@nvidia-elements/scene/frame/define.js';
      import '@nvidia-elements/scene/labels/define.js';
      import '@nvidia-elements/scene/model/define.js';
      import '@nvidia-elements/scene/heightfield/define.js';
      import '@nvidia-elements/scene/mesh/define.js';
      import '@nvidia-elements/scene/points/define.js';
      import '@nvidia-elements/scene/polygon/define.js';
      import '@nvidia-elements/scene/lines/define.js';
      import '@nvidia-elements/scene/triangles/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/axes/define.js';

      const labels = new LabelBuffer({ capacity: 1 });
      labels.add({ text: 'label', position: [0, 0, 2], scale: 18 });
      document.querySelector('#basic-labels').source = labels;

      const terrain = document.querySelector('#basic-terrain');
      terrain.grid = {
        origin: [-1, -1],
        spacing: 1,
        columns: 2,
        rows: 2,
        heights: new Float32Array([0, 0.1, 0.1, 0.4])
      };

      const mesh = document.querySelector('#basic-mesh');
      mesh.geometry = {
        positions: new Float32Array([0, 0, 0.75, 0.7, 0, 0, 0, 0.5, 0, -0.7, 0, 0, 0, -0.5, 0, 0, 0, -0.45]),
        indices: new Uint32Array([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 5, 2, 1, 5, 3, 2, 5, 4, 3, 5, 1, 4])
      };

      const points = new PointBuffer({ capacity: 3 });
      points.set(0, { position: [1, -3, 0.4], color: 'cyan' });
      points.set(1, { position: [1.25, -3, 0.4], color: 'magenta' });
      points.set(2, { position: [1.5, -3, 0.4], color: 'yellow' });
      document.querySelector('#basic-points').source = points;

      const lineRecords = new LineVertexBuffer({ capacity: 2 });
      lineRecords.set(0, { position: [2.8, -3.8, 0.1], color: 'magenta', width: 0.06 });
      lineRecords.set(1, { position: [4.2, -2.4, 0.4], color: 'magenta', width: 0.06 });
      document.querySelector('#basic-line').source = lineRecords;

      const triangleRecords = new TriangleVertexBuffer({ capacity: 3 });
      triangleRecords.set(0, { position: [5, -3.7, 0.05], color: [0, 1, 1, 1] });
      triangleRecords.set(1, { position: [6.5, -3.7, 0.05], color: [1, 0, 1, 1] });
      triangleRecords.set(2, { position: [5.75, -2.2, 0.05], color: [1, 1, 0, 1] });
      document.querySelector('#basic-triangle').source = triangleRecords;
    </script>
  `
};

/**
 * @summary Handle layer-level click and hover events while displaying the selected world-space position.
 */
export const Interactions = {
  render: () => html`
    <nve-scene id="pick-scene" aria-label="interactive scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes interactive source='[{"position":[0,0,0.5],"color":"yellow"},{"position":[2,0,0.5],"color":"cyan"}]'>
      </nve-scene-cubes>
    </nve-scene>
    <p id="pick-position" nve-text="body muted" nve-layout="pad:md">No position selected</p>
    <script type="module">
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/cubes/define.js';

      const scene = document.querySelector('#pick-scene');
      const cubeLayer = scene.querySelector('nve-scene-cubes');
      const clickCube = cubeLayer.source.at(0);
      const hoverCube = cubeLayer.source.at(1);
      const pickPosition = document.querySelector('#pick-position');
      const axes = ['x', 'y', 'z'];
      const cubeColors = ['cyan', 'magenta', 'yellow'];
      let cubeColorIndex = 0;

      scene.addEventListener('nve-scene-click', event => {
        const { layer, target, worldPosition } = event.detail;
        if (layer === cubeLayer && target.kind === 'instance' && target.index === clickCube.index) {
          clickCube.color = cubeColors[cubeColorIndex];
          cubeColorIndex = (cubeColorIndex + 1) % cubeColors.length;
          cubeLayer.publish({ count: 1, start: clickCube.index });
        }
        pickPosition.textContent = worldPosition.map((value, index) => axes[index] + ': ' + value.toFixed(2)).join(', ');
      });

      scene.addEventListener('nve-scene-pointerenter', event => {
        if (event.detail.layer !== cubeLayer || event.detail.target.index !== hoverCube.index) return;
        hoverCube.color = 'yellow';
        cubeLayer.publish({ count: 1, start: hoverCube.index });
      });

      scene.addEventListener('nve-scene-pointerleave', event => {
        if (event.detail.layer !== cubeLayer || event.detail.target.index !== hoverCube.index) return;
        hoverCube.color = 'cyan';
        cubeLayer.publish({ count: 1, start: hoverCube.index });
      });
    </script>
  `
};

/**
 * @summary Use feature IDs as application identity across click and hover events. Keep buffer records separately when interactions update source data.
 */
export const InteractionsList = {
  render: () => html`
    <nve-scene id="buffer-pick-scene" aria-label="buffer-backed interactive scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes id="buffer-pick-cubes" interactive></nve-scene-cubes>
    </nve-scene>
    <p id="buffer-pick-position" nve-text="body muted" nve-layout="pad:md">No position selected</p>
    <script type="module">
      import { CubeBuffer } from '@nvidia-elements/scene/cubes';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/cubes/define.js';

      const scene = document.querySelector('#buffer-pick-scene');
      const cubeLayer = scene.querySelector('#buffer-pick-cubes');
      const pickPosition = document.querySelector('#buffer-pick-position');
      const axes = ['x', 'y', 'z'];
      const cubeColors = ['cyan', 'magenta', 'yellow'];
      const CLICK_FEATURE_ID = 1;
      const HOVER_FEATURE_ID = 2;
      let cubeColorIndex = 0;

      const cubes = new CubeBuffer({ capacity: 2 });
      const clickCube = cubes.add({ featureId: CLICK_FEATURE_ID, position: [0, 0, 0.5], color: 'yellow' });
      const hoverCube = cubes.add({ featureId: HOVER_FEATURE_ID, position: [2, 0, 0.5], color: 'cyan' });
      cubeLayer.source = cubes;

      cubeLayer.addEventListener('nve-scene-click', event => {
        const { featureId, worldPosition } = event.detail;
        if (featureId === CLICK_FEATURE_ID) {
          clickCube.color = cubeColors[cubeColorIndex];
          cubeColorIndex = (cubeColorIndex + 1) % cubeColors.length;
          cubeLayer.publish({ count: 1, start: clickCube.index });
        }
        pickPosition.textContent = worldPosition
          .map((value, index) => axes[index] + ': ' + value.toFixed(2))
          .join(', ');
      });

      cubeLayer.addEventListener('nve-scene-pointerenter', event => {
        if (event.detail.featureId !== HOVER_FEATURE_ID) return;
        hoverCube.color = 'yellow';
        cubeLayer.publish({ count: 1, start: hoverCube.index });
      });

      cubeLayer.addEventListener('nve-scene-pointerleave', event => {
        if (event.detail.featureId !== HOVER_FEATURE_ID) return;
        hoverCube.color = 'cyan';
        cubeLayer.publish({ count: 1, start: hoverCube.index });
      });
    </script>
  `
};

/**
 * @summary Anchor a toggletip to a picked scene feature with the click event's source. Use this pattern to present details for one current scene selection.
 */
export const InteractionsPopover = {
  render: () => html`
    <nve-scene id="pick-scene-popover" aria-label="interactive scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes interactive id="pick-cubes-popover"></nve-scene-cubes>
    </nve-scene>
    <nve-toggletip id="pick-toggletip" position="top" hidden></nve-toggletip>
    <script type="module">
      import { CubeBuffer } from '@nvidia-elements/scene/cubes';
      import '@nvidia-elements/core/toggletip/define.js';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/cubes/define.js';

      const scene = document.querySelector('#pick-scene-popover');
      const cubeLayer = scene.querySelector('#pick-cubes-popover');
      const toggletip = document.querySelector('#pick-toggletip');

      const cubes = new CubeBuffer({ capacity: 2 });
      cubes.add({ featureId: 1, position: [0, 0, 0.5], color: 'yellow' });
      cubes.add({ featureId: 2, position: [2, 0, 0.5], color: 'cyan' });
      cubeLayer.source = cubes;

      cubeLayer.addEventListener('nve-scene-click', event => {
        const { featureId, source } = event.detail;
        if (featureId === undefined) {
          toggletip.hidePopover();
          return;
        }
        toggletip.textContent = 'Feature ' + featureId;
        toggletip.showPopover({ source });
      });
    </script>
  `
};

/**
 * @summary Move a frame by intersecting continuous pointer rays with an application-owned plane.
 */
export const CoordinateHelpers = {
  render: () => html`
    <nve-scene id="coordinate-scene" aria-label="Coordinate conversion helpers" style="min-height: 360px">
      <nve-scene-camera behavior="orbit" distance="6"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-frame id="coordinate-frame" position="[0,0,0]">
        <nve-scene-spheres source='[{"position":[0,0,0.25],"size":[0.25,0.25,0.25],"color":"cyan"}]'></nve-scene-spheres>
      </nve-scene-frame>
    </nve-scene>
    <script type="module">
      const scene = document.querySelector('#coordinate-scene');
      const frame = scene.querySelector('#coordinate-frame');

      scene.addEventListener('pointermove', event => {
        const ray = scene.getRay(event.clientX, event.clientY);
        if (!ray || Math.abs(ray.direction[2]) < 1e-8) return;
        const distance = -ray.origin[2] / ray.direction[2];
        if (distance < 0) return;
        frame.setPose({
          position: ray.origin.map((value, axis) => value + ray.direction[axis] * distance),
          orientation: [0, 0, 0, 1]
        });
      });
      await scene.ready;
    </script>
  `
};

/**
 * @summary Stable feature IDs let rendered line segments resolve to one application-owned inspection record. Use this pattern when picking should identify domain objects, with existing line colors making the selection visible.
 */
export const FeatureIdentity = {
  render: () => html`
    <nve-scene id="line-inspection-scene" aria-label="Cooling-water pipe inspection" style="min-height: 480px">
      <nve-scene-camera behavior="orbit" target="[0,0,0]"></nve-scene-camera>
      <nve-scene-gridlines count="8"></nve-scene-gridlines>
      <nve-scene-lines id="inspection-lines" topology="segments" width-unit="pixel" interactive></nve-scene-lines>
    </nve-scene>
    <p id="line-inspection-status" aria-live="polite" nve-text="body" nve-layout="pad:md">Select line.</p>
    <script type="module">
      import { LineVertexBuffer } from '@nvidia-elements/scene/lines';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/lines/define.js';

      const lineLayer = document.querySelector('#inspection-lines');
      const status = document.querySelector('#line-inspection-status');
      const inspections = new Map([
        [1842, 'Line 1842'],
        [2710, 'Line 2710']
      ]);
      const segments = [
        { featureId: 1842, color: [0, 220 / 255, 1, 1], start: [-4, -1.5, 0.15], end: [-2, -1.5, 0.15] },
        { featureId: 1842, color: [0, 220 / 255, 1, 1], start: [-2, -1.5, 0.15], end: [0, -1.5, 0.15] },
        { featureId: 1842, color: [0, 220 / 255, 1, 1], start: [0, -1.5, 0.15], end: [0, 1, 0.15] },
        { featureId: 2710, color: [1, 0, 1, 1], start: [1, -2.5, 0.15], end: [1, 0, 0.15] },
        { featureId: 2710, color: [1, 0, 1, 1], start: [1, 0, 0.15], end: [4, 0, 0.15] }
      ];
      const vertices = new LineVertexBuffer({ capacity: segments.length * 2 });

      for (const segment of segments) {
        vertices.add({ color: segment.color, position: segment.start, width: 8 });
        vertices.add({ position: segment.end });
      }

      vertices.featureIds = new Uint32Array(segments.map(segment => segment.featureId));
      lineLayer.source = vertices;

      lineLayer.addEventListener('nve-scene-click', event => {
        const { featureId } = event.detail;
        const inspection = inspections.get(featureId);
        if (!inspection) return;
        segments.forEach((segment, index) => {
          vertices.at(index * 2).color = segment.featureId === featureId ? [1, 1, 0, 1] : segment.color;
        });
        lineLayer.publish();
        status.textContent = inspection;
      });
    </script>
  `
};
