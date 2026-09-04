// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/spheres/define.js';
import '@nvidia-elements/scene/gridlines/define.js';

export default {
  title: 'Elements/Scene/Spheres',
  component: 'nve-scene-spheres'
};

/**
 * @summary Sphere markers compare three uniform scales and CMY instance colors. Use this pattern to distinguish categories while communicating relative radial extent in scene data.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="spheres scene">
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-spheres>
        <nve-scene-marker position="[-2.5,0,0.375]" scale="[0.75,0.75,0.75]" color="cyan"></nve-scene-marker>
        <nve-scene-marker position="[0,0,0.5]" scale="[1,1,1]" color="magenta"></nve-scene-marker>
        <nve-scene-marker position="[2.5,0,0.75]" scale="[1.5,1.5,1.5]" color="yellow"></nve-scene-marker>
      </nve-scene-spheres>
    </nve-scene>
  `
};
