// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneFrame } from '@nvidia-elements/scene/frame';
import '@nvidia-elements/scene/frame/define.js';

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value -- This package defines Scene Frame and Scene discovery content. */

describe(SceneFrame.metadata.tag, () => {
  it('should render nested coordinate-frame content on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-scene aria-label="Robot visualization">
        <nve-scene-frame name="base-link" position="[1,0,0]">
          <nve-scene-frame name="sensor" position="[0,0,1]"></nve-scene-frame>
        </nve-scene-frame>
      </nve-scene>
    `);

    expect(result.includes('nve-scene-frame')).toBe(true);
    expect(result.includes('slot></slot>')).toBe(true);
    expect(result.match(/shadowroot="open"/g)).toHaveLength(3);
  });
});
