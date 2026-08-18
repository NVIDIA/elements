// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/lines/define.js';
import '@nvidia-elements/scene/scene/define.js';

export default {
  title: 'Elements/Scene/Lines',
  component: 'nve-scene-lines'
};

/**
 * @summary Strip, loop, and segments layers show the three connectivity options. Use topology to describe how one vertex stream forms paths without duplicating loop endpoints or splitting independent segments into separate layers.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Line topology examples" style="min-height: 480px">
      <nve-scene-camera target="[0,0,0]" height="10"></nve-scene-camera>
      <nve-scene-gridlines count="8"></nve-scene-gridlines>
      <nve-scene-lines id="topology-strip" width-unit="pixel"></nve-scene-lines>
      <nve-scene-lines id="topology-loop" topology="loop" width-unit="pixel"></nve-scene-lines>
      <nve-scene-lines id="topology-circle" topology="loop" width-unit="pixel"></nve-scene-lines>
      <nve-scene-lines id="topology-segments" topology="segments" width-unit="pixel"></nve-scene-lines>
    </nve-scene>
    <script type="module">
      import { LINE_VERTEX, writeLineVertex } from '@nvidia-elements/scene';

      const setVertices = (id, records) => {
        const vertices = new Uint8Array(records.length * LINE_VERTEX.stride);
        records.forEach((record, index) => writeLineVertex(vertices, index, record));
        document.querySelector('#' + id).vertices = vertices;
      };

      const green = [0.46, 0.72, 0, 1];
      const blue = [0.15, 0.68, 0.95, 1];
      const magenta = [0.88, 0.38, 0.82, 1];
      const yellow = [1, 0.75, 0.1, 1];
      setVertices('topology-strip', [
        { position: [-3.5, 2.5, 0.05], color: green, width: 5 },
        { position: [-2, 1.2, 0.05], color: green, width: 5 },
        { position: [-0.5, 2.5, 0.05], color: green, width: 5 }
      ]);
      setVertices('topology-loop', [
        { position: [1, 1.2, 0.05], color: blue, width: 5 },
        { position: [3.5, 1.2, 0.05], color: blue, width: 5 },
        { position: [2.25, 3.2, 0.05], color: blue, width: 5 }
      ]);
      setVertices(
        'topology-circle',
        Array.from({ length: 32 }, (_, index) => {
          const angle = (index / 32) * Math.PI * 2;
          return {
            position: [-2 + Math.cos(angle) * 0.9, -1.8 + Math.sin(angle) * 0.9, 0.05],
            color: magenta,
            width: 5
          };
        })
      );
      setVertices('topology-segments', [
        { position: [0.5, -2.7, 0.05], color: yellow, width: 5 },
        { position: [3.5, -2.7, 0.05] },
        { position: [0.5, -1.8, 0.05], color: yellow, width: 5 },
        { position: [3.5, -1.8, 0.05] },
        { position: [0.5, -0.9, 0.05], color: yellow, width: 5 },
        { position: [3.5, -0.9, 0.05] }
      ]);
    </script>
  `
};

/**
 * @summary One strip varies color, width, and dash pattern by outgoing segment and uses zero width as a break. Use record styles for telemetry categories or planned-path states while retaining one streamed buffer.
 */
export const SegmentStyles = {
  render: () => html`
    <nve-scene aria-label="Styled line segments" style="min-height: 480px">
      <nve-scene-camera target="[0,0,0]" height="10"></nve-scene-camera>
      <nve-scene-gridlines count="8"></nve-scene-gridlines>
      <nve-scene-lines id="styled-path" width-unit="pixel"></nve-scene-lines>
    </nve-scene>
    <script type="module">
      import { LINE_VERTEX, writeLineVertex } from '@nvidia-elements/scene';

      const records = [
        { position: [-4, 1, 0.05], color: [0.46, 0.72, 0, 1], width: 3 },
        { position: [-2, 2, 0.05], color: [0.15, 0.68, 0.95, 1], width: 8, dash: 18, gap: 10 },
        { position: [0, 1, 0.05], width: 0 },
        { position: [1, -1, 0.05], color: [1, 0.75, 0.1, 1], width: 5 },
        { position: [4, -1, 0.05] }
      ];
      const vertices = new Uint8Array(records.length * LINE_VERTEX.stride);
      records.forEach((record, index) => writeLineVertex(vertices, index, record));
      document.querySelector('#styled-path').vertices = vertices;
    </script>
  `
};

/**
 * @summary Two route markers compare a display-stable overlay with geometry that scales as the camera moves. Use this pattern when an interface combines screen annotations and spatial measurements.
 */
export const WidthUnits = {
  render: () => html`
    <nve-scene aria-label="Pixel and world line widths" style="min-height: 480px">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="9"></nve-scene-camera>
      <nve-scene-gridlines count="8"></nve-scene-gridlines>
      <nve-scene-lines id="pixel-width" width-unit="pixel"></nve-scene-lines>
      <nve-scene-lines id="world-width"></nve-scene-lines>
    </nve-scene>
    <script type="module">
      import { LINE_VERTEX, writeLineVertex } from '@nvidia-elements/scene';

      const setSegment = (id, start, end, style) => {
        const vertices = new Uint8Array(2 * LINE_VERTEX.stride);
        writeLineVertex(vertices, 0, { position: start, ...style });
        writeLineVertex(vertices, 1, { position: end });
        document.querySelector('#' + id).vertices = vertices;
      };
      setSegment('pixel-width', [-3, -2, 0.05], [-3, 2, 0.05], {
        color: [0.15, 0.68, 0.95, 1],
        width: 8
      });
      setSegment('world-width', [3, -2, 0.05], [3, 2, 0.05], {
        color: [0.46, 0.72, 0, 1],
        normal: [0, 0, 1],
        width: 0.25
      });
    </script>
  `
};

/**
 * @summary A streaming line traces recent position samples with one reusable buffer. Use this pattern for continuous telemetry that updates only changed records.
 */
export const StreamingTrail = {
  render: () => html`
    <nve-scene id="streaming-trail-scene" aria-label="Autonomous mobile robot route history" style="min-height: 480px">
      <nve-scene-camera target="[0,0,0]" height="14"></nve-scene-camera>
      <nve-scene-gridlines count="12"></nve-scene-gridlines>
      <nve-scene-lines id="streaming-trail" width-unit="pixel"></nve-scene-lines>
    </nve-scene>
    <script type="module">
      import { LINE_VERTEX, writeLineVertex } from '@nvidia-elements/scene';

      const scene = document.querySelector('#streaming-trail-scene');
      const trail = scene.querySelector('#streaming-trail');
      const maxSamples = 96;
      const vertices = new Uint8Array(maxSamples * LINE_VERTEX.stride);
      const colorOffset = LINE_VERTEX.fields.color.offset;
      const aisleRoute = [[-5, -4], [4, -4], [4, 1], [-1, 1], [-1, 4], [-5, 4]];
      let sampleCount = 0;
      let previousSampleTime = -Infinity;

      trail.count = 0;
      trail.vertices = vertices;

      function positionAt(time) {
        const progress = time / 2600;
        const segment = Math.floor(progress) % aisleRoute.length;
        const next = (segment + 1) % aisleRoute.length;
        const segmentProgress = progress % 1;
        const [startX, startY] = aisleRoute[segment];
        const [endX, endY] = aisleRoute[next];
        return [startX + (endX - startX) * segmentProgress, startY + (endY - startY) * segmentProgress, 0.05];
      }

      function appendSample(position) {
        if (sampleCount === maxSamples) {
          vertices.copyWithin(0, LINE_VERTEX.stride);
          sampleCount -= 1;
        }
        writeLineVertex(vertices, sampleCount, { position, color: [0.46, 0.72, 0, 1], width: 6 });
        sampleCount += 1;
        for (let index = 0; index < sampleCount; index += 1) {
          const alpha = 0.1 + 0.9 * (sampleCount === 1 ? 1 : index / (sampleCount - 1));
          vertices[index * LINE_VERTEX.stride + colorOffset + 3] = Math.round(alpha * 255);
        }
        trail.commit(0, sampleCount);
        trail.count = sampleCount;
      }

      requestAnimationFrame(function stream(time) {
        if (!scene.isConnected) return;
        if (time - previousSampleTime >= 80) {
          appendSample(positionAt(time));
          previousSampleTime = time;
        }
        requestAnimationFrame(stream);
      });
    </script>
  `
};
