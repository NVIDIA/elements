// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/cubes/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/marker/define.js';

export default {
  title: 'Elements/Scene/Marker',
  component: 'nve-scene-marker'
};

/**
 * @summary Colored marker transforms provide readable declarative instances for modest scene datasets. Use streamed buffers for larger or frequently changing datasets.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Marker transform">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes>
        <nve-scene-marker
          aria-label="Select green cube"
          color="#76b900"
          position="[1,0,0.5]"
          scale="[1,1,2]"
          tabindex="0"
        ></nve-scene-marker>
      </nve-scene-cubes>
    </nve-scene>
  `
};

/**
 * @summary Handle marker click and hover events alongside programmatic pick results that display world-space coordinates at the authoring level that owns the selected data.
 */
export const Interactions = {
  render: () => html`
    <nve-scene id="pick-scene" aria-label="Pickable scene">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes>
        <nve-scene-marker id="pick-marker" aria-label="click cube to cycle colors" position="[0,0,0.5]" color="yellow"></nve-scene-marker>
        <nve-scene-marker id="hover-marker" aria-label="hover over blue cube" position="[2,0,0.5]" color="cyan"></nve-scene-marker>
      </nve-scene-cubes>
    </nve-scene>
    <p id="pick-position" nve-text="body muted" nve-layout="pad-top:md">No position selected</p>
    <script type="module">
      const scene = document.querySelector('#pick-scene');
      const marker = document.querySelector('#pick-marker');
      const hoverMarker = document.querySelector('#hover-marker');
      const pickPosition = document.querySelector('#pick-position');
      const axes = ['x', 'y', 'z'];
      const markerColors = ['yellow', 'cyan', 'magenta'];
      let markerColorIndex = 0;

      marker.addEventListener('click', () => {
        marker.color = markerColors[markerColorIndex];
        markerColorIndex = (markerColorIndex + 1) % markerColors.length;
      });

      hoverMarker.addEventListener('pointerenter', () => (hoverMarker.color = 'yellow'));
      hoverMarker.addEventListener('pointerleave', () => (hoverMarker.color = 'cyan'));

      scene.addEventListener('click', async event => {
        const hit = await scene.pick(event.clientX, event.clientY);
        pickPosition.textContent = hit
          ? hit.worldPosition.map((value, index) => axes[index] + ': ' + value.toFixed(2)).join(', ')
          : 'No position selected';
      });
    </script>
  `
};
