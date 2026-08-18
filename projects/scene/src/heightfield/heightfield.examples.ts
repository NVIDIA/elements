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
 * @summary Assign a uniform grid to render smooth, frame-local terrain.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Heightfield scene">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-heightfield id="terrain"></nve-scene-heightfield>
    </nve-scene>
    <script>
      document.querySelector('#terrain').grid = {
        spacing: 1,
        columns: 3,
        rows: 3,
        heights: new Float32Array([0, 0.1, 0, 0.1, 0.4, 0.1, 0, 0.1, 0])
      };
    </script>
  `
};

/**
 * @summary A colored terrain surface drapes a route over sampled elevations and reports a pin at each selected location. Use it to inspect terrain data while keeping elevation queries visible and understandable.
 */
export const TerrainExplorer = {
  render: () => html`
    <nve-scene id="terrain-demo-scene" aria-label="Terrain" style="height: 360px">
      <nve-scene-heightfield id="terrain-demo" color="#ffffff"></nve-scene-heightfield>
      <nve-scene-lines id="terrain-route" width-unit="pixel"></nve-scene-lines>
      <nve-scene-spheres id="terrain-pin" hidden>
        <nve-scene-marker color="#fc0" scale="[0.8,0.8,0.8]"></nve-scene-marker>
      </nve-scene-spheres>
      <nve-scene-camera
        behavior="orbit"
        target="[0,0,1]"
        distance="52"
        phi="0.92"
        theta="-0.75"
        projection="perspective"
        fovy="0.785398163"
        min-distance="15"
        max-distance="100"
      ></nve-scene-camera>
    </nve-scene>
    <output id="terrain-readout" aria-atomic="true" aria-label="Selected terrain elevation" aria-live="polite">Select terrain for elevation.</output>
    <script type="module">
      import { LINE_VERTEX, writeLineVertex } from '@nvidia-elements/scene';

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
      const vertices = new Uint8Array(size * LINE_VERTEX.stride);
      for (let index = 0; index < size; index += 1) {
        writeLineVertex(vertices, index, {
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
      terrain.addEventListener('nve-scene-pick', showHeight);
      route.addEventListener('nve-scene-pick', showHeight);
    </script>
  `
};
