// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/axes/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default { title: 'Elements/Scene/Axes', component: 'nve-scene-axes' };

/**
 * @summary Frame-local axes show the fixed X, Y, and Z orientation colors. Use them to orient robotics geometry without introducing interactive scene data.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Frame axes">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-axes length="1" width="2"></nve-scene-axes>
      <nve-scene-camera behavior="orbit" distance="4" azimuth="-0.99484"></nve-scene-camera>
    </nve-scene>
  `
};

/**
 * @summary Bidirectional axes extend equally across positive and negative X, Y, and Z. Use them to compare geometry on either side of a frame origin.
 */
export const Bidirectional = {
  render: () => html`
    <nve-scene aria-label="Bidirectional frame axes">
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-axes direction="bidirectional" length="1" width="2"></nve-scene-axes>
      <nve-scene-camera behavior="orbit" distance="4" azimuth="-0.99484"></nve-scene-camera>
    </nve-scene>
  `
};
