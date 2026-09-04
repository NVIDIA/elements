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
    <nve-scene>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes>
        <nve-scene-marker color="#76b900" position="[1,0,0.5]" scale="[1,1,2]"></nve-scene-marker>
      </nve-scene-cubes>
    </nve-scene>
  `
};

/**
 * @summary Handle marker click and hover events alongside programmatic pick results that display world-space coordinates at the authoring level that owns the selected data.
 */
export const Interactions = {
  render: () => html`
    <nve-scene id="pick-scene" aria-label="interactive scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes interactive>
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
      const markerColors = ['cyan', 'magenta', 'yellow'];
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

/**
 * @summary Handle click and hover events for buffer-backed markers through their shared layer. Use instance indices to update frequently changing scene data without creating one DOM element per marker.
 */
export const InteractionsList = {
  render: () => html`
    <nve-scene id="buffer-pick-scene" aria-label="buffer-backed interactive scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-cubes id="buffer-pick-markers" interactive></nve-scene-cubes>
    </nve-scene>
    <p id="buffer-pick-position" nve-text="body muted" nve-layout="pad-top:md">No position selected</p>
    <script type="module">
      import { MarkerBuffer } from '@nvidia-elements/scene';

      const markerLayer = document.querySelector('#buffer-pick-markers');
      const pickPosition = document.querySelector('#buffer-pick-position');
      const axes = ['x', 'y', 'z'];
      const markerColors = ['cyan', 'magenta', 'yellow'];
      let markerColorIndex = 0;

      const markers = new MarkerBuffer({ capacity: 2 });
      const clickMarker = markers.add({ position: [0, 0, 0.5], color: 'yellow' });
      const hoverMarker = markers.add({ position: [2, 0, 0.5], color: 'cyan' });
      markerLayer.instances = markers;

      markerLayer.addEventListener('nve-scene-click', event => {
        const { instanceIndex, worldPosition } = event.detail;
        if (instanceIndex === clickMarker.index) {
          clickMarker.color = markerColors[markerColorIndex];
          markerColorIndex = (markerColorIndex + 1) % markerColors.length;
          markerLayer.commit(clickMarker.index, 1);
        }
        pickPosition.textContent = worldPosition
          .map((value, index) => axes[index] + ': ' + value.toFixed(2))
          .join(', ');
      });

      markerLayer.addEventListener('nve-scene-pointerenter', event => {
        if (event.detail.instanceIndex !== hoverMarker.index) return;
        hoverMarker.color = 'yellow';
        markerLayer.commit(hoverMarker.index, 1);
      });

      markerLayer.addEventListener('nve-scene-pointerleave', event => {
        if (event.detail.instanceIndex !== hoverMarker.index) return;
        hoverMarker.color = 'cyan';
        markerLayer.commit(hoverMarker.index, 1);
      });
    </script>
  `
};
