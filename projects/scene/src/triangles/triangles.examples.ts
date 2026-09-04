// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { html } from 'lit';
import '@nvidia-elements/scene/triangles/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Triangles',
  component: 'nve-scene-triangles'
};

/**
 * @summary A centered, multicolor triangle provides a minimal spatial reference. Use it to verify geometry placement and color interpolation.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="example triangles">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-triangles id="example-triangles"></nve-scene-triangles>
    </nve-scene>
    <script type="module">
      import { TriangleVertexBuffer } from '@nvidia-elements/scene';

      const vertices = new TriangleVertexBuffer({ capacity: 3 });
      vertices.set(0, { position: [-0.75, -0.5, 0.05], color: [0, 1, 1, 1] });
      vertices.set(1, { position: [0.75, -0.5, 0.05], color: [1, 0, 1, 1] });
      vertices.set(2, { position: [0, 1, 0.05], color: [1, 1, 0, 1] });
      document.querySelector('#example-triangles').vertices = vertices;
    </script>
  `
}

/**
 * @summary An unlit, per-vertex-color driving corridor streams as triangle-list records. Use ranged commit updates for transient planning or perception overlays that change frequently.
 */
export const Path = {
  render: () => html`
    <nve-scene aria-label="planned driving corridor">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-triangles id="driving-corridor"></nve-scene-triangles>
    </nve-scene>
    <script type="module">
      import { TriangleVertexBuffer } from '@nvidia-elements/scene';

      const corridor = document.querySelector('#driving-corridor');
      const sections = [
        { left: [-1.3, -2.5, 0.02], right: [1.3, -2.5, 0.02], color: [0.46, 0.72, 0, 0.35] },
        { left: [-1.1, -1.1, 0.02], right: [1.1, -1.1, 0.02], color: [0.46, 0.72, 0, 0.45] },
        { left: [-0.8, 0.35, 0.02], right: [1.15, 0.5, 0.02], color: [0.93, 0.72, 0, 0.55] },
        { left: [-0.25, 1.8, 0.02], right: [1.35, 2.2, 0.02], color: [0.86, 0.31, 0.31, 0.65] }
      ];
      const vertices = sections.slice(0, -1).flatMap((section, index) => {
        const next = sections[index + 1];
        return [
          { position: section.left, color: section.color },
          { position: section.right, color: section.color },
          { position: next.right, color: next.color },
          { position: section.left, color: section.color },
          { position: next.right, color: next.color },
          { position: next.left, color: next.color }
        ];
      });
      const buffer = new TriangleVertexBuffer({ capacity: vertices.length });
      vertices.forEach((vertex, index) => buffer.set(index, vertex));
      corridor.vertices = buffer;

      // On a later planning cycle, mutate affected records and call corridor.commit(start, count).
    </script>
  `
};
