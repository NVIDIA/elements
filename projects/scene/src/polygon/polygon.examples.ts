// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/polygon/define.js';

export default {
  title: 'Elements/Scene/Polygon',
  component: 'nve-scene-polygon'
};

/**
 * @summary Three scaled polygon geometries show an arrow, holed octagon, and upside-down T against an orbitable reference grid. Use separate polygon elements when each surface needs its own topology and base color.
 */
export const Default = {
  render: () => html`
    <nve-scene aria-label="Upward arrow, octagon, and upside-down T polygons" style="background: black">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="8"></nve-scene-camera>
      <nve-scene-gridlines></nve-scene-gridlines>
      <nve-scene-polygon
        color="cyan"
        geometry='{"outer":[[-0.25,-1.2],[0.25,-1.2],[0.25,0],[0.8,0],[0,1.2],[-0.8,0],[-0.25,0]]}'
      >
        <nve-scene-marker position="[-2.2,0,0.01]" scale="[0.5,0.5,1]"></nve-scene-marker>
      </nve-scene-polygon>
      <nve-scene-polygon
        color="magenta"
        geometry='{"outer":[[-1.2,0.5],[-1.2,-0.5],[-0.5,-1.2],[0.5,-1.2],[1.2,-0.5],[1.2,0.5],[0.5,1.2],[-0.5,1.2]],"holes":[[[-0.35,0.35],[0.35,0.35],[0.35,-0.35],[-0.35,-0.35]]]}'
      >
        <nve-scene-marker position="[0,0,0.01]" scale="[0.5,0.5,1]"></nve-scene-marker>
      </nve-scene-polygon>
      <nve-scene-polygon
        color="yellow"
        geometry='{"outer":[[-0.8,-1.2],[0.8,-1.2],[0.8,-0.6],[0.3,-0.6],[0.3,1.2],[-0.3,1.2],[-0.3,-0.6],[-0.8,-0.6]]}'
      >
        <nve-scene-marker position="[2.2,0,0.01]" scale="[0.5,0.5,1]"></nve-scene-marker>
      </nve-scene-polygon>
    </nve-scene>
  `
};
