// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/cubes/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Cubes',
  component: 'nve-scene-cubes'
};

/**
 * @summary Cube markers compare three uniform scales and CMY instance colors. Use this pattern to distinguish categories while communicating relative extents in scene data.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Cubes scene">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes>
        <nve-scene-marker position="[-2.5,0,0.375]" scale="[0.75,0.75,0.75]" color="cyan"></nve-scene-marker>
        <nve-scene-marker position="[0,0,0.5]" scale="[1,1,1]" color="magenta"></nve-scene-marker>
        <nve-scene-marker position="[2.5,0,0.75]" scale="[1.5,1.5,1.5]" color="yellow"></nve-scene-marker>
      </nve-scene-cubes>
    </nve-scene>
  `
};

/**
 * @summary Overlapping translucent boxes use independent face and outline colors for readable volume boundaries. Use declarative markers and streamed records together when perception results mix authored and live regions.
 */
export const Volumes = {
  render: () => html`
    <nve-scene aria-label="Overlapping perception volumes">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="7" phi="1.25" theta="-0.55"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes>
        <nve-scene-marker position="[-0.65,0,0.8]" scale="[2.5,1.7,1.6]" color="rgba(118,185,0,0.24)" outline-color="rgba(118,185,0,0.95)"></nve-scene-marker>
        <nve-scene-marker position="[0.55,0.2,0.65]" scale="[2.2,2.1,1.3]" color="rgba(0,160,255,0.22)" outline-color="rgba(0,160,255,0.95)"></nve-scene-marker>
      </nve-scene-cubes>
      <nve-scene-cubes id="streamed-volumes"></nve-scene-cubes>
    </nve-scene>
    <script type="module">
      import { MARKER, writeMarker } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/cubes/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';

      const records = new Uint8Array(MARKER.stride);
      writeMarker(records, 0, {
        position: [0, -0.75, 0.55],
        scale: [1.5, 2.3, 1.1],
        color: [1, 0.35, 0.1, 0.2],
        outlineColor: [1, 0.35, 0.1, 0.95]
      });
      document.querySelector('#streamed-volumes').instances = records;
    </script>
  `
};

/**
 * @summary A fixed-capacity sensor grid maps values through the Virdis scale while reusing one binary marker buffer and committing only each incoming row. Use this pattern for frequent scalar telemetry updates when scene topology stays stable.
 */
export const Streaming = {
  render: () => html`
    <nve-scene aria-label="streaming cubes">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes id="streamed-cubes"></nve-scene-cubes>
    </nve-scene>
    <script type="module">
      import { getThemeTokens } from '@nvidia-elements/core';
      import { MARKER, writeMarker } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/cubes/define.js';

      const cubes = document.querySelector('#streamed-cubes');
      const columns = 12;
      const rows = 8;
      const records = new Uint8Array(columns * rows * MARKER.stride);
      const tokens = getThemeTokens();
      const colorCanvas = document.createElement('canvas');
      colorCanvas.width = 1;
      colorCanvas.height = 1;
      const colorContext = colorCanvas.getContext('2d', { willReadFrequently: true });
      if (!colorContext) throw new Error('A 2D canvas context is required to resolve visualization colors.');

      const resolveColor = stop => {
        const token = '--nve-sys-visualization-sequential-diverging-virdis-' + stop;
        const value = tokens[token];
        if (!value) throw new Error('Missing visualization token: ' + token);
        colorContext.fillStyle = value;
        colorContext.fillRect(0, 0, 1, 1);
        const color = colorContext.getImageData(0, 0, 1, 1).data;
        return [color[0] / 255, color[1] / 255, color[2] / 255];
      };

      const palette = [1300, 1000, 700, 500, 300].map(resolveColor);
      const colorAt = sample => {
        const position = sample * (palette.length - 1);
        const startIndex = Math.min(Math.floor(position), palette.length - 2);
        const mix = position - startIndex;
        const start = palette[startIndex];
        const end = palette[startIndex + 1];
        return [
          start[0] + (end[0] - start[0]) * mix,
          start[1] + (end[1] - start[1]) * mix,
          start[2] + (end[2] - start[2]) * mix,
          1
        ];
      };

      const writeRow = (row, time) => {
        for (let column = 0; column < columns; column += 1) {
          const sample = (Math.sin(time * 0.002 + column * 0.55 + row * 0.8) + 1) / 2;
          const height = 0.12 + sample * 1.1;
          writeMarker(records, row * columns + column, {
            position: [(column - (columns - 1) / 2) * 0.45, (row - (rows - 1) / 2) * 0.45, height / 2],
            scale: [0.36, 0.36, height],
            color: colorAt(sample)
          });
        }
      };

      for (let row = 0; row < rows; row += 1) writeRow(row, 0);
      cubes.instances = records;

      let nextRow = 0;
      const streamRow = time => {
        writeRow(nextRow, time);
        cubes.commit(nextRow * columns, columns);
        nextRow = (nextRow + 1) % rows;
        requestAnimationFrame(streamRow);
      };
      requestAnimationFrame(streamRow);
    </script>
  `
};

/**
 * @summary Selectable loads of animated cubes use a Virdis lookup table while sharing one layer and reusable buffer. Use streaming when one observed marker element per instance would dominate the work.
 */
export const Performance = {
  render: () => html`
    <section nve-layout="column gap:sm" style="position: relative;">
      <nve-scene aria-label="performance scene">
        <nve-scene-camera behavior="orbit" target="[0,0,0.4]" distance="6.7" phi="1.33" theta="-0.5"></nve-scene-camera>
        <nve-scene-cubes id="performance-cubes"></nve-scene-cubes>
      </nve-scene>
      <nve-select layout="horizontal-inline" fit-content style="position: absolute; top: 12px; left: 12px;">
        <label for="performance-count">Cube count</label>
        <select id="performance-count">
          <option value="100">100</option>
          <option value="1000">1,000</option>
          <option value="10000" selected>10,000</option>
        </select>
      </nve-select>
    </section>
    <script type="module">
      import { getThemeTokens } from '@nvidia-elements/core';
      import { MARKER, writeMarker } from '@nvidia-elements/scene';
      import '@nvidia-elements/core/select/define.js';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/cubes/define.js';

      const cubes = document.querySelector('#performance-cubes');
      const countSelect = document.querySelector('#performance-count');
      const positionZOffset = MARKER.fields.position.offset + 8;
      const scaleZOffset = MARKER.fields.scale.offset + 8;
      const colorOffset = MARKER.fields.color.offset;
      const tokens = getThemeTokens();
      const colorCanvas = document.createElement('canvas');
      colorCanvas.width = 1;
      colorCanvas.height = 1;
      const colorContext = colorCanvas.getContext('2d', { willReadFrequently: true });
      if (!colorContext) throw new Error('A 2D canvas context is required to resolve visualization colors.');

      const resolveColor = stop => {
        const token = '--nve-sys-visualization-sequential-diverging-virdis-' + stop;
        const value = tokens[token];
        if (!value) throw new Error('Missing visualization token: ' + token);
        colorContext.fillStyle = value;
        colorContext.fillRect(0, 0, 1, 1);
        const color = colorContext.getImageData(0, 0, 1, 1).data;
        return [color[0] / 255, color[1] / 255, color[2] / 255];
      };

      const palette = [1300, 1000, 700, 500, 300].map(resolveColor);
      const colorAt = sample => {
        const position = sample * (palette.length - 1);
        const startIndex = Math.min(Math.floor(position), palette.length - 2);
        const mix = position - startIndex;
        const start = palette[startIndex];
        const end = palette[startIndex + 1];
        return [
          start[0] + (end[0] - start[0]) * mix,
          start[1] + (end[1] - start[1]) * mix,
          start[2] + (end[2] - start[2]) * mix,
          1
        ];
      };
      const packedColors = Uint32Array.from({ length: 256 }, (_, index) => {
        const color = colorAt(index / 255);
        return (
          Math.round(color[0] * 255) |
          (Math.round(color[1] * 255) << 8) |
          (Math.round(color[2] * 255) << 16) |
          (255 << 24)
        );
      });
      let columns;
      let rows;
      let spacing;
      let width;
      let instanceCount;
      let records;
      let view;

      const sampleInstance = (column, row, time) =>
        (Math.sin(time * 0.003 + column * 0.16) + Math.cos(time * 0.002 + row * 0.19) + 2) / 4;

      const initializeInstance = index => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const sample = sampleInstance(column, row, 0);
        const height = 0.04 + sample * 0.45;
        writeMarker(records, index, {
          position: [(column - (columns - 1) / 2) * spacing, (row - (rows - 1) / 2) * spacing, height / 2],
          scale: [width, width, height],
          color: colorAt(sample)
        });
      };

      const updateInstance = (index, time) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const sample = sampleInstance(column, row, time);
        const height = 0.04 + sample * 0.45;
        const recordOffset = index * MARKER.stride;

        // Update only the fields that change; the initial orientation and XY values remain in place.
        view.setFloat32(recordOffset + positionZOffset, height / 2, true);
        view.setFloat32(recordOffset + scaleZOffset, height, true);
        view.setUint32(recordOffset + colorOffset, packedColors[Math.round(sample * 255)], true);
      };

      const setInstanceCount = count => {
        columns = Math.ceil(Math.sqrt(count));
        rows = Math.ceil(count / columns);
        instanceCount = count;
        spacing = 5.5 / columns;
        width = spacing * 0.8;
        records = new Uint8Array(instanceCount * MARKER.stride);
        view = new DataView(records.buffer);

        for (let index = 0; index < instanceCount; index += 1) initializeInstance(index);
        cubes.instances = records;
      };

      countSelect.addEventListener('change', () => setInstanceCount(Number(countSelect.value)));

      setInstanceCount(Number(countSelect.value));

      const animate = time => {
        for (let index = 0; index < instanceCount; index += 1) updateInstance(index, time);
        cubes.commit(0, instanceCount);
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    </script>
  `
};
