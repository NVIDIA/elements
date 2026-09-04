// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Gridlines',
  component: 'nve-scene-gridlines'
};

/**
 * @summary A frame-local grid provides a finite, evenly spaced reference plane for robotics geometry.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Reference grid">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines spacing="1" count="10" width="1"></nve-scene-gridlines>
    </nve-scene>
  `
};
