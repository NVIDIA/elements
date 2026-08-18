// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/arrows/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Arrows',
  component: 'nve-scene-arrows'
};

/**
 * @summary Arrow markers compare three scales and CMY instance colors while preserving the positive z-axis direction. Use this pattern to distinguish magnitude or category in directional scene data.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Arrows scene">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-arrows>
        <nve-scene-marker from="-2.5 0 0" to="-2.5 0 1.5" color="cyan"></nve-scene-marker>
        <nve-scene-marker from="0 0 0" to="0 0 2" color="magenta"></nve-scene-marker>
        <nve-scene-marker from="2.5 0 0" to="2.5 0 3" color="yellow"></nve-scene-marker>
      </nve-scene-arrows>
    </nve-scene>
  `
};
