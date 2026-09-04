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
