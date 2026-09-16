// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/arrows/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Arrows',
  component: 'nve-scene-arrows'
};

/**
 * @summary Arrow markers show a small vector field with CMY instance colors. Use declarative markers for small, static vector annotations.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="arrows scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-arrows>
        <nve-scene-marker
          position="[-2.5,-0.4,0]"
          orientation="[0,0.289784,0,0.957092]"
          scale="[0.1,0.1,1.802776]"
          color="cyan"
        ></nve-scene-marker>
        <nve-scene-marker
          position="[0,0,0]"
          orientation="[-0.178425,0,0,0.983954]"
          scale="[0.1,0.1,2.136001]"
          color="magenta"
        ></nve-scene-marker>
        <nve-scene-marker
          position="[2.5,0.4,0]"
          orientation="[0.083812,-0.209529,0,0.974204]"
          scale="[0.1,0.1,2.44949]"
          color="yellow"
        ></nve-scene-marker>
      </nve-scene-arrows>
    </nve-scene>
  `
};

/**
 * @summary Arrow markers supplied by a packed buffer reproduce the declarative scene. Use a MarkerBuffer for large or frequently updated vector fields.
 */
export const BufferSource = {
  render: () => html`
    <nve-scene aria-label="buffered arrows scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-arrows id="buffered-arrows"></nve-scene-arrows>
    </nve-scene>
    <script type="module">
      import { MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/arrows/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const markers = new MarkerBuffer({ capacity: 3 });
      markers.add({ position: [-2.5, -0.4, 0], orientation: [0, 0.289784, 0, 0.957092], scale: [0.1, 0.1, 1.802776], color: 'cyan', featureId: 10 });
      markers.add({ position: [0, 0, 0], orientation: [-0.178425, 0, 0, 0.983954], scale: [0.1, 0.1, 2.136001], color: 'magenta', featureId: 11 });
      markers.add({ position: [2.5, 0.4, 0], orientation: [0.083812, -0.209529, 0, 0.974204], scale: [0.1, 0.1, 2.44949], color: 'yellow', featureId: 12 });
      document.querySelector('#buffered-arrows').source = markers;
    </script>
  `
};
