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
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-mesh id="example-mesh">
        <nve-scene-marker position="[-1.25,0,0.6]" color="cyan"></nve-scene-marker>
        <nve-scene-marker position="[1.25,0,0.6]" orientation="[0,0,0.382683,0.92388]" scale="[0.75,0.75,1.25]" color="magenta"></nve-scene-marker>
      </nve-scene-mesh>
      <script type="module">
        const mesh = document.querySelector('#example-mesh');
        mesh.geometry = {
          positions: new Float32Array([0, 0, 0.75, 0.7, 0, 0, 0, 0.5, 0, -0.7, 0, 0, 0, -0.5, 0, 0, 0, -0.45]),
          normals: new Float32Array([0, 0, 1, 1, 0, 0, 0, 1, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1]),
          indices: new Uint32Array([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 5, 2, 1, 5, 3, 2, 5, 4, 3, 5, 1, 4])
        };
      </script>
    </nve-scene>
  `
};

/**
 * @summary Mesh instances supplied by a packed buffer reproduce the declarative scene while sharing one geometry. Use a MarkerBuffer for large or frequently updated instance sets.
 */
export const BufferSource = {
  render: () => html`
    <nve-scene aria-label="buffered example mesh">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-mesh id="buffered-example-mesh"></nve-scene-mesh>
      <script type="module">
        import { MarkerBuffer } from '@nvidia-elements/scene';
        import '@nvidia-elements/scene/camera/define.js';
        import '@nvidia-elements/scene/gridlines/define.js';
        import '@nvidia-elements/scene/mesh/define.js';
        import '@nvidia-elements/scene/scene/define.js';

        const mesh = document.querySelector('#buffered-example-mesh');
        mesh.geometry = {
          positions: new Float32Array([0, 0, 0.75, 0.7, 0, 0, 0, 0.5, 0, -0.7, 0, 0, 0, -0.5, 0, 0, 0, -0.45]),
          normals: new Float32Array([0, 0, 1, 1, 0, 0, 0, 1, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1]),
          indices: new Uint32Array([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 5, 2, 1, 5, 3, 2, 5, 4, 3, 5, 1, 4])
        };

        const markers = new MarkerBuffer({ capacity: 2 });
        markers.add({ position: [-1.25, 0, 0.6], color: 'cyan' });
        markers.add({
          position: [1.25, 0, 0.6],
          orientation: [0, 0, 0.382683, 0.92388],
          scale: [0.75, 0.75, 1.25],
          color: 'magenta'
        });
        mesh.source = markers;
      </script>
    </nve-scene>
  `
};

/**
 * @summary Publish partial mesh deformations from a reused producer array without replacing the GPU buffers.
 */
export const GeometryUpdates = {
  render: () => html`
    <nve-scene aria-label="Atomic mesh geometry updates" style="min-height: 360px">
      <nve-scene-camera behavior="orbit" distance="5"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-mesh id="updated-mesh" color="cyan"></nve-scene-mesh>
    </nve-scene>
    <script type="module">
      const mesh = document.querySelector('#updated-mesh');
      const positions = new Float32Array([-1, -1, 0.2, 1, -1, 0.2, -1, 1, 0.2, 1, 1, 0.2]);
      const indices = new Uint32Array([0, 1, 2, 1, 3, 2]);
      mesh.geometry = { indices, positions };
      let raised = false;

      function deformGeometry() {
        raised = !raised;
        positions[8] = positions[11] = raised ? 0.8 : 0.2;
        mesh.publishGeometry({ attribute: 'positions', count: 2, start: 2 });
        if (mesh.isConnected) setTimeout(deformGeometry, 1800);
      }

      setTimeout(deformGeometry, 1800);
    </script>
  `
};

/**
 * @summary Capture an independent mesh texture and close the caller input after Scene reports that it applied.
 */
export const TextureCapture = {
  render: () => html`
    <nve-scene aria-label="Owned mesh texture" style="min-height: 360px">
      <nve-scene-camera behavior="orbit" distance="4"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-mesh id="textured-mesh"></nve-scene-mesh>
    </nve-scene>
    <script type="module">
      const mesh = document.querySelector('#textured-mesh');
      mesh.geometry = {
        positions: new Float32Array([-1, -1, 0.2, 1, -1, 0.2, -1, 1, 0.2, 1, 1, 0.2]),
        indices: new Uint32Array([0, 1, 2, 1, 3, 2]),
        uvs: new Float32Array([0, 1, 1, 1, 0, 0, 1, 0])
      };

      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 2;
      const context = canvas.getContext('2d');
      context.fillStyle = '#76b900';
      context.fillRect(0, 0, 2, 2);
      context.fillStyle = '#00ffff';
      context.fillRect(0, 0, 1, 1);
      context.fillRect(1, 1, 1, 1);
      const input = await createImageBitmap(canvas);
      const result = await mesh.setTexture(input);
      input.close();
      if (result.status === 'failed') await mesh.setTexture(null);
    </script>
  `
};
