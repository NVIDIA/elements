// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneJoint } from '@nvidia-elements/scene/joint';
import '@nvidia-elements/scene/joint/define.js';

describe(SceneJoint.metadata.tag, () => {
  it('captures numeric motion without browser DOM traversal', () => {
    const joint = new SceneJoint();
    joint.type = 'prismatic';
    joint.value = 2;
    expect(joint.pose.position).toEqual([2, 0, 0]);
    expect(joint.pose.orientation).toEqual([0, 0, 0, 1]);
  });

  it('renders flat body connections on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-scene aria-label="Robot visualization">
        <nve-scene-body name="base"></nve-scene-body>
        <nve-scene-body name="sensor"></nve-scene-body>
        <nve-scene-joint name="lift" parent="base" child="sensor" type="prismatic" axis="[0,0,1]" value="0.5"></nve-scene-joint>
      </nve-scene>
    `);
    expect(result).toContain('parent="base"');
    expect(result).toContain('child="sensor"');
    expect(result).toContain('value="0.5"');
    expect(result.match(/shadowroot="open"/g)).toHaveLength(4);
  });
});
