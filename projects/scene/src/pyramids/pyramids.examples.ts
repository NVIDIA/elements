// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/pyramids/define.js';

export default {
  title: 'Elements/Scene/Pyramids',
  component: 'nve-scene-pyramids'
};

/**
 * @summary Pyramid markers compare three scales and CMY instance colors while preserving the positive z-axis apex direction. Use this pattern to distinguish magnitude or category in bounded scene data.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Pyramids scene">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-pyramids>
        <nve-scene-marker position="[-2.5,0,0.75]" scale="[0.75,0.75,1.5]" color="cyan"></nve-scene-marker>
        <nve-scene-marker position="[0,0,1]" scale="[1,1,2]" color="magenta"></nve-scene-marker>
        <nve-scene-marker position="[2.5,0,1.5]" scale="[1.5,1.5,3]" color="yellow"></nve-scene-marker>
      </nve-scene-pyramids>
    </nve-scene>
  `
};
