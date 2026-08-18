// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneModel } from './model.js';
import './define.js';

describe(SceneModel.metadata.tag, () => {
  it('renders nested scene parts on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-scene-model>
        <nve-scene-part shape="cone" position="[1,2,3]"></nve-scene-part>
      </nve-scene-model>
    `);

    expect(result).toContain(SceneModel.metadata.tag);
    expect(result).toContain('nve-scene-part');
    expect(result).toContain('shape="cone"');
    expect(result).toContain('position="[1,2,3]"');
    expect(result.match(/shadowroot="open"/g)).toHaveLength(2);
  });
});
