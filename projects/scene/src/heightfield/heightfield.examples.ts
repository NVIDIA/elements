// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/heightfield/define.js';
import '@nvidia-elements/scene/lines/define.js';
import '@nvidia-elements/scene/spheres/define.js';

export default {
  title: 'Elements/Scene/Heightfield',
  component: 'nve-scene-heightfield'
};

/**
 * @summary A small elevation grid blends cyan, yellow, and magenta across two smooth peaks. Use this introductory pattern to show per-sample height and color data without obscuring the core grid API.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Colorful heightfield scene">
      <nve-scene-camera behavior="orbit" target="[0,0,0.5]" distance="8" phi="1" theta="-0.7"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-heightfield id="terrain" color="#ffffff"></nve-scene-heightfield>
    </nve-scene>
    <script type="module">
      const c = [0, 255, 255, 255];
      const y = [255, 255, 0, 255];
      const m = [255, 0, 255, 255];

      document.querySelector('#terrain').grid = {
        origin: [-2, -2],
        spacing: 1,
        columns: 5,
        rows: 5,
        heights: new Float32Array([
          0, 0.15, 0.35, 0.2, 0,
          0.15, 0.65, 1.25, 0.75, 0.15,
          0.25, 1.15, 0.55, 1.35, 0.3,
          0.1, 0.55, 0.9, 0.6, 0.15,
          0, 0.1, 0.25, 0.1, 0
        ]),
        colors: new Uint8Array([
          ...c, ...c, ...c, ...m, ...m,
          ...c, ...c, ...m, ...m, ...m,
          ...c, ...y, ...y, ...m, ...m,
          ...y, ...y, ...y, ...y, ...m,
          ...y, ...y, ...y, ...y, ...m
        ])
      };
    </script>
  `
};

/**
 * @summary A synthetic mobile-robot floor scan combines wheel ruts, a loading ramp, an expansion joint, and a localized obstacle. Elevation uses the Virdis scale while a categorical color separates the planned route, a useful pattern for traversability and facility-mapping views.
 */
export const RobotSurvey = {
  render: () => html`
    <section nve-layout="column gap:sm">
      <nve-scene aria-label="Mobile robot warehouse floor survey">
        <nve-scene-camera behavior="orbit" target="[0,-1,0.22]" distance="13" phi="0.95" theta="-2"></nve-scene-camera>
        <nve-scene-gridlines></nve-scene-gridlines>
        <nve-scene-heightfield id="robot-survey-terrain" color="#ffffff"></nve-scene-heightfield>
        <nve-scene-lines id="robot-survey-route" width-unit="pixel"></nve-scene-lines>
      </nve-scene>
      <div nve-layout="row gap:sm align:center pad:sm">
        <span nve-text="label sm muted">Lower elevation</span>
        <span aria-hidden="true" style="width: min(240px, 35vw); height: 8px; border-radius: 4px; background: linear-gradient(90deg, var(--nve-sys-visualization-sequential-diverging-virdis-1300), var(--nve-sys-visualization-sequential-diverging-virdis-1000), var(--nve-sys-visualization-sequential-diverging-virdis-700), var(--nve-sys-visualization-sequential-diverging-virdis-500), var(--nve-sys-visualization-sequential-diverging-virdis-300));"></span>
        <span nve-text="label sm muted">Higher elevation</span>
        <span aria-hidden="true" style="width: 12px; height: 4px; border-radius: 2px; background: var(--nve-sys-visualization-categorical-nova);"></span>
        <span nve-text="label sm muted">Planned route</span>
      </div>
    </section>
    <script type="module">
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/heightfield/define.js';
      import '@nvidia-elements/scene/spheres/define.js';
      import '@nvidia-elements/scene/lines/define.js';
      import { getThemeTokens } from '@nvidia-elements/core';
      import { LineVertexBuffer } from '@nvidia-elements/scene';

      const terrain = document.querySelector('#robot-survey-terrain');
      const route = document.querySelector('#robot-survey-route');
      const columns = 45;
      const rows = 31;
      const spacing = 0.25;
      const originX = -((columns - 1) * spacing) / 2;
      const originY = -((rows - 1) * spacing) / 2;
      const heights = new Float32Array(columns * rows);
      const colors = new Uint8Array(columns * rows * 4);
      const clamp = value => Math.max(0, Math.min(1, value));
      const smoothstep = value => {
        const sample = clamp(value);
        return sample * sample * (3 - 2 * sample);
      };
      const gaussian = (x, y, centerX, centerY, widthX, widthY) =>
        Math.exp(-(((x - centerX) / widthX) ** 2 + ((y - centerY) / widthY) ** 2));
      const elevation = (x, y) => {
        const floorVariation = 0.017 * Math.sin(x * 1.7) * Math.cos(y * 1.3) + 0.01 * Math.sin((x + y) * 3.1);
        const aisleEnvelope = gaussian(x, 0, -1.4, 0, 4.4, 2.7);
        const wheelRuts =
          -0.065 * aisleEnvelope *
          (Math.exp(-(((y - 0.72) / 0.14) ** 2)) + Math.exp(-(((y + 0.72) / 0.14) ** 2)));
        const expansionJoint = -0.04 * gaussian(x, y, 0.6, 0, 0.1, 3.4);
        const loadingBay = smoothstep((x - 1.9) / 2.4) * smoothstep((3.45 - Math.abs(y)) / 0.55);
        const palletDebris = 0.32 * gaussian(x, y, -1.55, 0.05, 0.48, 0.42);
        return floorVariation + wheelRuts + expansionJoint + loadingBay * 0.62 + palletDebris;
      };

      let minimumHeight = Infinity;
      let maximumHeight = -Infinity;
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;
          const x = originX + column * spacing;
          const y = originY + row * spacing;
          const height = elevation(x, y);
          heights[index] = height;
          minimumHeight = Math.min(minimumHeight, height);
          maximumHeight = Math.max(maximumHeight, height);
        }
      }

      const tokens = getThemeTokens();
      const colorCanvas = document.createElement('canvas');
      colorCanvas.width = 1;
      colorCanvas.height = 1;
      const colorContext = colorCanvas.getContext('2d', { willReadFrequently: true });

      const resolveColor = token => {
        const value = tokens[token];
        if (!value) throw new Error('Missing visualization token: ' + token);
        colorContext.fillStyle = value;
        colorContext.fillRect(0, 0, 1, 1);
        return colorContext.getImageData(0, 0, 1, 1).data;
      };
      const palette = [1300, 1000, 700, 500, 300].map(stop =>
        resolveColor('--nve-sys-visualization-sequential-diverging-virdis-' + stop)
      );
      const colorAt = sample => {
        const position = clamp(sample) * (palette.length - 1);
        const startIndex = Math.min(Math.floor(position), palette.length - 2);
        const mix = position - startIndex;
        const start = palette[startIndex];
        const end = palette[startIndex + 1];
        return [
          Math.round(start[0] + (end[0] - start[0]) * mix),
          Math.round(start[1] + (end[1] - start[1]) * mix),
          Math.round(start[2] + (end[2] - start[2]) * mix),
          255
        ];
      };

      const heightRange = maximumHeight - minimumHeight;
      for (let index = 0; index < heights.length; index += 1) {
        colors.set(colorAt((heights[index] - minimumHeight) / heightRange), index * 4);
      }
      terrain.grid = { origin: [originX, originY], spacing, columns, rows, heights, colors };

      const routeSamples = 48;
      const routePoints = new Float32Array(routeSamples * 3);
      for (let index = 0; index < routeSamples; index += 1) {
        const progress = index / (routeSamples - 1);
        const x = originX + 0.4 + progress * 9.8;
        const obstacleDetour = -0.95 * Math.exp(-(((x + 1.55) / 0.85) ** 2));
        routePoints[index * 3] = x;
        routePoints[index * 3 + 1] = -0.15 + obstacleDetour;
      }

      const routeColor = resolveColor('--nve-sys-visualization-categorical-nova');
      const drapedRoute = terrain.drape(routePoints, 0.055);
      const routeVertices = new LineVertexBuffer({ capacity: routeSamples });
      for (let index = 0; index < routeSamples; index += 1) {
        routeVertices.set(index, {
          position: [drapedRoute[index * 3], drapedRoute[index * 3 + 1], drapedRoute[index * 3 + 2]],
          color: [routeColor[0] / 255, routeColor[1] / 255, routeColor[2] / 255, 1],
          width: 4
        });
      }
      route.vertices = routeVertices;
    </script>
  `
};

/**
 * @summary A colored terrain surface drapes a route over sampled elevations and reports a pin at each selected location. Use it to inspect terrain data while keeping elevation queries visible and understandable.
 */
export const TerrainExplorer = {
  render: () => html`
    <nve-scene id="terrain-demo-scene" aria-label="Terrain" style="height: 360px">
      <nve-scene-heightfield id="terrain-demo" color="#ffffff" interactive></nve-scene-heightfield>
      <nve-scene-lines id="terrain-route" interactive width-unit="pixel"></nve-scene-lines>
      <nve-scene-spheres id="terrain-pin" hidden>
        <nve-scene-marker color="#fc0" scale="[0.8,0.8,0.8]"></nve-scene-marker>
      </nve-scene-spheres>
      <nve-scene-camera behavior="orbit" target="[0,0,1]" distance="52" phi="0.92" theta="-0.75" projection="perspective" fovy="0.785398163" min-distance="15" max-distance="100"></nve-scene-camera>
    </nve-scene>
    <output id="terrain-readout" aria-atomic="true" aria-label="Selected terrain elevation" aria-live="polite">Select terrain for elevation.</output>
    <script type="module">
      import '@nvidia-elements/scene/scene/define.js'
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/heightfield/define.js';
      import '@nvidia-elements/scene/lines/define.js';
      import { LineVertexBuffer } from '@nvidia-elements/scene';

      const terrainElement = suffix => document.getElementById('terrain-' + suffix);
      const terrain = terrainElement('demo');
      const route = terrainElement('route');
      const pinLayer = terrainElement('pin');
      const pin = pinLayer.querySelector('nve-scene-marker');
      const readout = terrainElement('readout');
      const size = 41;
      const spacing = 1;
      const origin = -20;
      const heights = new Float32Array(size * size);
      const colors = new Uint8Array(size * size * 4);

      const elevation = (x, y) =>
        Math.sin(x * 0.22) * 1.6 + Math.cos(y * 0.18) * 1.1 + 3.2 * Math.exp(-(x * x + y * y) / 60);

      for (let row = 0; row < size; row += 1) {
        for (let column = 0; column < size; column += 1) {
          const x = origin + column * spacing;
          const y = origin + row * spacing;
          const height = elevation(x, y);
          const slope = Math.atan(
            Math.hypot(
              (elevation(x + spacing, y) - elevation(x - spacing, y)) / 2,
              (elevation(x, y + spacing) - elevation(x, y - spacing)) / 2
            )
          );
          const normalized = (height + 2.7) / 8.7;
          const index = row * size + column;
          const offset = index * 4;
          heights[index] = height;
          colors.set([40 + normalized * 170 + slope * 20, 90 + normalized * 100 - slope * 25, 70 + normalized * 90, 255], offset);
        }
      }

      terrain.grid = { origin: [origin, origin], spacing, columns: size, rows: size, heights, colors };

      const routePoints = new Float32Array(size * 3);
      for (let index = 0; index < size; index += 1) {
        routePoints[index * 3] = origin + index * spacing;
        routePoints[index * 3 + 1] = Math.sin((index / (size - 1)) * Math.PI * 2) * 6;
      }
      const drapedRoute = terrain.drape(routePoints, 0.15);
      const vertices = new LineVertexBuffer({ capacity: size });
      for (let index = 0; index < size; index += 1) {
        vertices.set(index, {
          position: [drapedRoute[index * 3], drapedRoute[index * 3 + 1], drapedRoute[index * 3 + 2]],
          color: [0.46, 0.72, 0, 1],
          width: 3
        });
      }
      route.vertices = vertices;

      const showHeight = event => {
        const [x, y] = event.detail.worldPosition;
        const height = terrain.heightAt(x, y);
        if (height === undefined) return;
        pin.position = [x, y, height + 0.4].join(' ');
        pinLayer.hidden = false;
        readout.value =
          height.toFixed(2) + ' m at (' + x.toFixed(1) + ', ' + y.toFixed(1) + ')';
      };
      terrain.addEventListener('nve-scene-click', showHeight);
      route.addEventListener('nve-scene-click', showHeight);
    </script>
  `
};
