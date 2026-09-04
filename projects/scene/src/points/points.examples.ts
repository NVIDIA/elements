// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/scene/axes/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/points/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Points',
  component: 'nve-scene-points'
};

/**
 * @summary A multicolor scatter plot combines deterministic 3D samples with a grid and axes. Use it to compare spatial categories at a glance.
 */
export const Default = {
  render: () => html`
    <nve-scene id="example-scene" aria-label="example points scene">
      <nve-scene-camera behavior="orbit" distance="4"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-points id="example-points" size="8"></nve-scene-points>
    </nve-scene>
    <script type="module">
      import { PointBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/points/define.js';

      const points = new PointBuffer({ capacity: 3 });
      points.set(0, { position: [0, 0, 0.2], color: 'cyan' });
      points.set(1, { position: [0.25, 0, 0.4], color: 'magenta' });
      points.set(2, { position: [0.5, 0, 0.6], color: 'yellow' });
      document.querySelector('#example-points').instances = points;
    </script>
  `
};

/**
 * @summary A multicolor scatter plot combines deterministic 3D samples with a grid and axes. Use it to compare spatial categories at a glance.
 */
export const ScatterPlot = {
  render: () => html`
    <nve-scene id="scatter-scene" aria-label="multicolor 3D scatter plot">
      <nve-scene-camera behavior="orbit" projection="perspective" target="[0,0,2.2]" distance="18" phi="0.86" theta="-0.88" fovy="0.785398163"></nve-scene-camera>
      <nve-scene-gridlines spacing="1" count="15" width="1"></nve-scene-gridlines>
      <nve-scene-axes length="8" width="1"></nve-scene-axes>
      <nve-scene-points id="scatter-points" size="8"></nve-scene-points>
    </nve-scene>
    <script type="module">
      import { PointBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/axes/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/points/define.js';

      let seed = 2026;
      const count = 36;
      const points = new PointBuffer({ capacity: count });
      const palette = [[0.66, 0.25, 0.96, 1], [1, 0.82, 0.25, 1], [0.28, 0.64, 1, 1], [0.28, 0.96, 0.54, 1], [1, 0.31, 0.35, 1]];
      const pointLayer = document.querySelector('#scatter-points');
      const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);

      for (let index = 0; index < count; index += 1) {
        points.set(index, {
          position: [(random() - 0.5) * 12, (random() - 0.5) * 12, 0.3 + random() * 3.7],
          color: palette[index % palette.length]
        });
      }

      pointLayer.instances = points;
    </script>
  `
};

/**
 * @summary Display-stable markers contrast with spatially scaled geometry. Use this pattern when overlays and physical measurements must remain visually distinct as the camera moves.
 */
export const SizeUnits = {
  render: () => html`
    <nve-scene aria-label="Pixel and world point sizes" style="min-height: 480px">
      <nve-scene-camera behavior="orbit" projection="perspective" target="[0,0,0]" distance="8"></nve-scene-camera>
      <nve-scene-gridlines count="8"></nve-scene-gridlines>
      <nve-scene-points id="pixel-size" size="12"></nve-scene-points>
      <nve-scene-points id="world-size" size="0.4" size-unit="world"></nve-scene-points>
    </nve-scene>
    <script type="module">
      import { PointBuffer } from '@nvidia-elements/scene';

      const pixelPoints = new PointBuffer({ capacity: 1 });
      const worldPoints = new PointBuffer({ capacity: 1 });
      pixelPoints.set(0, { position: [-1.5, 0, 0.05], color: 'cyan' });
      worldPoints.set(0, { position: [1.5, 0, 0.05], color: 'magenta' });
      document.querySelector('#pixel-size').instances = pixelPoints;
      document.querySelector('#world-size').instances = worldPoints;
    </script>
  `
};

/**
 * @summary Render a ray-sampled lidar map with occlusion, surface noise, height and intensity coloring, camera views, and adjustable scan density for autonomous-vehicle perception displays.
 */
export const Lidar = {
  render: () => html`
    <div id="lidar-demo" style="position: relative; min-height: 100%;">
      <nve-scene id="lidar-scene" aria-label="Lidar street scan" style="width: 100%; height: 100%;">
        <nve-scene-camera behavior="orbit"></nve-scene-camera>
        <nve-scene-points id="lidar-cloud" size="2"></nve-scene-points>
      </nve-scene>
      <nve-card aria-label="Lidar display controls" style="position: absolute; inset-block-start: 16px; inset-inline-start: 16px; width: min(340px, calc(100% - 32px));">
        <nve-card-header>
          <h2 nve-text="heading sm medium">Lidar street scan</h2>
        </nve-card-header>
        <nve-card-content>
          <div nve-layout="column gap:sm">
            <p nve-text="body sm muted"><output id="lidar-count" aria-live="polite">Building scan…</output></p>
            <div nve-layout="row gap:sm align:vertical-center">
              <span nve-text="label sm muted" style="width: 68px; flex: none;">color by</span>
              <nve-button-group id="lidar-color" behavior-select="single" container="flat">
                <nve-button pressed container="flat" size="sm" data-color="height">height</nve-button>
                <nve-button container="flat" size="sm" data-color="intensity">intensity</nve-button>
              </nve-button-group>
            </div>
            <div nve-layout="row gap:sm align:vertical-center">
              <span nve-text="label sm muted" style="width: 68px; flex: none;">view</span>
              <nve-button-group id="lidar-view" behavior-select="single" container="flat">
                <nve-button pressed container="flat" size="sm" data-view="3d">3D</nve-button>
                <nve-button container="flat" size="sm" data-view="plan">plan</nve-button>
              </nve-button-group>
            </div>
            <div nve-layout="row gap:sm align:vertical-center">
              <span nve-text="label sm muted" style="width: 68px; flex: none;">resolution</span>
              <nve-button-group id="lidar-resolution" behavior-select="single" container="flat">
                <nve-button container="flat" size="sm" data-resolution="0.25">0.25×</nve-button>
                <nve-button container="flat" size="sm" data-resolution="0.5">0.5×</nve-button>
                <nve-button container="flat" size="sm" data-resolution="1">1×</nve-button>
                <nve-button pressed container="flat" size="sm" data-resolution="2">2×</nve-button>
              </nve-button-group>
            </div>
            <p nve-text="body sm muted">Drag to orbit · scroll to zoom</p>
          </div>
        </nve-card-content>
      </nve-card>
    </div>
    <script type="module">
      import { POINT, PointBuffer } from '@nvidia-elements/scene';

      const scene = document.querySelector('#lidar-scene');
      const camera = scene.querySelector('nve-scene-camera');
      const cloud = document.querySelector('#lidar-cloud');
      const countOutput = document.querySelector('#lidar-count');
      const capacity = 1450000;
      const positions = new Float32Array(capacity * 3);
      const intensities = new Float32Array(capacity);
      let point = 0;
      let seed = 2077;
      const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
      const between = (minimum, maximum) => minimum + random() * (maximum - minimum);
      const noise = amount => (random() + random() + random() - 1.5) * amount;
      const clamp = value => Math.min(1, Math.max(0, value));
      const add = (x, y, z, intensity) => {
        if (point === capacity) return;
        positions.set([x, y, z], point * 3);
        intensities[point] = clamp(intensity);
        point += 1;
      };
      const boxes = [];
      const spheres = [];
      const cylinders = [];
      const addBox = (minimum, maximum, material) => boxes.push({ minimum, maximum, material });

      for (const side of [-1, 1]) {
        let x = -72;
        while (x < 72) {
          const width = between(8, 14);
          const front = side * between(10.7, 13.1);
          const depth = between(4, 7);
          const height = between(7.5, 18);
          addBox(
            [x, side < 0 ? front - depth : front, 0],
            [Math.min(74, x + width), side < 0 ? front : front + depth, height],
            'building'
          );
          x += width + between(1.1, 3.4);
        }
      }

      const carLocations = [
        [-57, -4.8], [-43, 4.8], [-28, -4.7], [-12, 4.7], [5, -4.8],
        [20, 4.8], [35, -4.7], [49, 4.8], [61, -4.8]
      ];
      for (const [x, y] of carLocations) {
        addBox([x - 2.2, y - 0.9, 0.2], [x + 2.2, y + 0.9, 0.85], 'vehicle');
        addBox([x - 1.15, y - 0.76, 0.85], [x + 1.25, y + 0.76, 1.55], 'glass');
      }

      const streetFurniture = [-62, -48, -33, -18, -2, 14, 30, 46, 61];
      for (const [tree, x] of streetFurniture.entries()) {
        const side = tree % 2 === 0 ? -1 : 1;
        const y = side * 8.85;
        cylinders.push({ x, y, radius: 0.18, bottom: 0.2, top: 3.3, material: 'trunk' });
        spheres.push({ center: [x - 0.45, y, 4.15], radius: 1.7, material: 'foliage' });
        spheres.push({ center: [x + 0.65, y + 0.15, 4.35], radius: 1.55, material: 'foliage' });
        spheres.push({ center: [x, y - 0.35 * side, 5.05], radius: 1.45, material: 'foliage' });
      }

      for (const side of [-1, 1]) {
        for (let x = -64; x <= 64; x += 16) {
          cylinders.push({ x, y: side * 9.25, radius: 0.1, bottom: 0.15, top: 6.2, material: 'pole' });
        }
      }

      const boxRange = (origin, direction, box) => {
        let near = 0.01;
        let far = 90;
        for (let axis = 0; axis < 3; axis += 1) {
          if (Math.abs(direction[axis]) < 0.000001) {
            if (origin[axis] < box.minimum[axis] || origin[axis] > box.maximum[axis]) return Infinity;
            continue;
          }
          let first = (box.minimum[axis] - origin[axis]) / direction[axis];
          let second = (box.maximum[axis] - origin[axis]) / direction[axis];
          if (first > second) [first, second] = [second, first];
          near = Math.max(near, first);
          far = Math.min(far, second);
          if (near > far) return Infinity;
        }
        return near;
      };
      const sphereRange = (origin, direction, sphere) => {
        const x = origin[0] - sphere.center[0];
        const y = origin[1] - sphere.center[1];
        const z = origin[2] - sphere.center[2];
        const projection = x * direction[0] + y * direction[1] + z * direction[2];
        const discriminant = projection * projection - (x * x + y * y + z * z - sphere.radius * sphere.radius);
        if (discriminant < 0) return Infinity;
        const range = -projection - Math.sqrt(discriminant);
        return range > 0.01 ? range : Infinity;
      };
      const cylinderRange = (origin, direction, cylinder) => {
        const x = origin[0] - cylinder.x;
        const y = origin[1] - cylinder.y;
        const a = direction[0] * direction[0] + direction[1] * direction[1];
        const b = 2 * (x * direction[0] + y * direction[1]);
        const c = x * x + y * y - cylinder.radius * cylinder.radius;
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0 || a < 0.000001) return Infinity;
        const range = (-b - Math.sqrt(discriminant)) / (2 * a);
        const z = origin[2] + direction[2] * range;
        return range > 0.01 && z >= cylinder.bottom && z <= cylinder.top ? range : Infinity;
      };
      const groundIntensity = (x, y) => {
        const crosswalk = x > 6 && x < 12 && Math.abs(y) < 6.2 && Math.floor((y + 6.2) / 0.85) % 2 === 0;
        const dashed = Math.abs(Math.abs(y) - 3.05) < 0.1 && (x + 72) % 7 < 3.4;
        const edge = Math.abs(Math.abs(y) - 6.1) < 0.09;
        const curb = Math.abs(Math.abs(y) - 7.15) < 0.14;
        if (crosswalk || dashed || edge) return 0.95;
        if (curb) return 0.62;
        return Math.abs(y) < 7.15 ? 0.12 : 0.31;
      };

      await new Promise(resolve => requestAnimationFrame(resolve));
      const sensorX = Array.from({ length: 17 }, (_, index) => -64 + index * 8);
      const golden = 0.618033988749895;
      for (let ray = 0; ray < 1350000; ray += 1) {
        const origin = [sensorX[ray % sensorX.length], (ray % 3 - 1) * 0.55, 1.9];
        const azimuth = Math.PI * 2 * ((ray * golden + random() * 0.0015) % 1);
        const elevation = between(-0.31, 0.26) + noise(0.002);
        const horizontal = Math.cos(elevation);
        const direction = [Math.cos(azimuth) * horizontal, Math.sin(azimuth) * horizontal, Math.sin(elevation)];
        let range = direction[2] < -0.0001 ? -origin[2] / direction[2] : Infinity;
        let material = 'ground';
        let surface;
        const groundX = origin[0] + direction[0] * range;
        const groundY = origin[1] + direction[1] * range;
        if (range > 90 || Math.abs(groundX) > 74 || Math.abs(groundY) > 14.5) range = Infinity;
        for (const box of boxes) {
          const candidate = boxRange(origin, direction, box);
          if (candidate < range) {
            range = candidate;
            material = box.material;
            surface = box;
          }
        }
        for (const sphere of spheres) {
          const candidate = sphereRange(origin, direction, sphere);
          if (candidate < range) {
            range = candidate;
            material = sphere.material;
            surface = sphere;
          }
        }
        for (const cylinder of cylinders) {
          const candidate = cylinderRange(origin, direction, cylinder);
          if (candidate < range) {
            range = candidate;
            material = cylinder.material;
            surface = cylinder;
          }
        }
        if (!Number.isFinite(range) || range > 90) continue;
        const measured = range + noise(0.018 + range * 0.0007);
        const x = origin[0] + direction[0] * measured + noise(0.006 + range * 0.00015);
        const y = origin[1] + direction[1] * measured + noise(0.006 + range * 0.00015);
        const z = origin[2] + direction[2] * measured + noise(0.005 + range * 0.0001);
        if (material === 'building') {
          const localX = x - surface.minimum[0];
          const window = localX % 2.65 > 0.55 && localX % 2.65 < 1.95 && z % 3.05 > 1.05 && z % 3.05 < 2.35;
          const door = z < 2.55 && Math.abs(localX - (surface.maximum[0] - surface.minimum[0]) / 2) < 1.1;
          if ((window && random() < 0.74) || (door && random() < 0.88) || random() < 0.015 + range * 0.0007) continue;
          add(x, y, z, window ? 0.08 : 0.44 + noise(0.08));
        } else if (material === 'ground') {
          add(x, y, z, groundIntensity(x, y) + noise(0.035));
        } else if (material === 'foliage') {
          if (random() < 0.32) continue;
          add(x, y, z, 0.3 + random() * 0.24);
        } else {
          const signal = material === 'pole' ? 0.82 : material === 'glass' ? 0.16 : material === 'vehicle' ? 0.58 : 0.38;
          add(x, y, z, signal + noise(0.07));
        }
      }

      for (const side of [-1, 1]) {
        for (let start = -64; start < 64; start += 16) {
          for (let sample = 0; sample < 260; sample += 1) {
            const progress = sample / 260;
            const x = start + progress * 16;
            const sag = Math.sin(progress * Math.PI) * 0.42;
            add(x + noise(0.015), side * 9.25 + noise(0.012), 6.05 - sag + noise(0.012), 0.78);
            add(x + noise(0.015), side * 9.52 + noise(0.012), 5.72 - sag + noise(0.012), 0.72);
          }
        }
      }

      for (let index = point - 1; index > 0; index -= 1) {
        const swap = Math.floor(random() * (index + 1));
        for (let axis = 0; axis < 3; axis += 1) {
          const value = positions[index * 3 + axis];
          positions[index * 3 + axis] = positions[swap * 3 + axis];
          positions[swap * 3 + axis] = value;
        }
        const signal = intensities[index];
        intensities[index] = intensities[swap];
        intensities[swap] = signal;
      }

      const heightPoints = new PointBuffer({ capacity: point });
      const turbo = value => {
        const palette = [
          [0.18, 0.06, 0.28],
          [0.12, 0.38, 0.82],
          [0, 0.78, 0.95],
          [0.2, 0.94, 0.48],
          [0.98, 0.84, 0.08],
          [0.94, 0.12, 0.025]
        ];
        const scaled = clamp(value) * (palette.length - 1);
        const lower = Math.min(palette.length - 2, Math.floor(scaled));
        const mix = scaled - lower;
        return [...palette[lower].map((channel, index) => channel + (palette[lower + 1][index] - channel) * mix), 1];
      };
      for (let index = 0; index < point; index += 1) {
        const offset = index * 3;
        heightPoints.set(index, {
          position: [positions[offset], positions[offset + 1], positions[offset + 2]],
          color: turbo(Math.pow(clamp(Math.max(0, positions[offset + 2]) / 12), 0.72))
        });
      }
      const intensityBytes = heightPoints.bytes.slice();
      for (let index = 0; index < point; index += 1) {
        const color = Math.round((0.08 + intensities[index] * 0.92) * 255);
        const offset = index * POINT.stride + 12;
        intensityBytes[offset] = color;
        intensityBytes[offset + 1] = color;
        intensityBytes[offset + 2] = color;
      }

      const cameras = {
        '3d': {
          target: { position: [0, 0, 3.2], heading: 0 },
          offset: { distance: 66, phi: 0.9, theta: -0.88 },
          projection: { mode: 'perspective', fovy: Math.PI / 4 }
        },
        plan: {
          target: { position: [0, 0, 0], heading: 0 },
          offset: { distance: 100, phi: 0.12, theta: -0.75 },
          projection: { mode: 'ortho', frustumHeight: 86 }
        }
      };
      const applyCamera = state => {
        camera.target = state.target.position.join(' ');
        camera.heading = state.target.heading;
        camera.distance = state.offset.distance;
        camera.phi = state.offset.phi;
        camera.theta = state.offset.theta;
        camera.projection = state.projection.mode;
        if (state.projection.mode === 'perspective') camera.fovy = state.projection.fovy;
        else camera.frustumHeight = state.projection.frustumHeight;
      };
      const baseCount = Math.ceil(point / 2);
      let resolution = 2;
      const updateCount = () => {
        cloud.count = Math.min(point, Math.round(baseCount * resolution));
        countOutput.value = cloud.count.toLocaleString() + ' points';
      };
      cloud.instances = heightPoints;
      applyCamera(cameras['3d']);
      updateCount();

      document.querySelector('#lidar-color').addEventListener('click', event => {
        const button = event.composedPath().find(item => item.dataset?.color);
        if (button) cloud.instances = button.dataset.color === 'intensity' ? intensityBytes : heightPoints;
      });
      document.querySelector('#lidar-view').addEventListener('click', event => {
        const button = event.composedPath().find(item => item.dataset?.view);
        if (button) applyCamera(cameras[button.dataset.view]);
      });
      document.querySelector('#lidar-resolution').addEventListener('click', event => {
        const button = event.composedPath().find(item => item.dataset?.resolution);
        if (!button) return;
        resolution = Number(button.dataset.resolution);
        updateCount();
      });
    </script>
  `
};
