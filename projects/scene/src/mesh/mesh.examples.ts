// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/mesh/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Mesh',
  component: 'nve-scene-mesh'
};

/**
 * @summary Define indexed, lit mesh geometry once and reuse it with marker transforms. Use for persistent robot or environment assets that need normals, textures, or efficient instancing.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="example mesh">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-mesh id="example-mesh">
        <nve-scene-marker position="[-1.25,0,0.6]" color="cyan"></nve-scene-marker>
        <nve-scene-marker position="[1.25,0,0.6]" orientation="[0,0,0.382683,0.92388]" scale="[0.75,0.75,1.25]" color="magenta"></nve-scene-marker>
      </nve-scene-mesh>
      <script type="module">
        const mesh = document.querySelector('#example-mesh');
        mesh.positions = new Float32Array([0, 0, 0.75, 0.7, 0, 0, 0, 0.5, 0, -0.7, 0, 0, 0, -0.5, 0, 0, 0, -0.45]);
        mesh.normals = new Float32Array([0, 0, 1, 1, 0, 0, 0, 1, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1]);
        mesh.indices = new Uint32Array([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 5, 2, 1, 5, 3, 2, 5, 4, 3, 5, 1, 4]);
      </script>
    </nve-scene>
  `
};
