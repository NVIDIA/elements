// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneModel } from '@nvidia-elements/scene/model';
import '@nvidia-elements/scene/model/define.js';

describe(SceneModel.metadata.tag, () => {
  it('should render nested entity content on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-scene aria-label="Robot visualization">
        <nve-scene-model name="base-link" position="[1,0,0]">
          <nve-scene-model name="sensor" frame="base-link" position="[0,0,1]"></nve-scene-model>
        </nve-scene-model>
      </nve-scene>
    `);

    expect(result.includes('nve-scene-model')).toBe(true);
    expect(result).toContain('frame="base-link"');
    expect(result.includes('slot></slot>')).toBe(true);
    expect(result.match(/shadowroot="open"/g)).toHaveLength(3);
  });
});
