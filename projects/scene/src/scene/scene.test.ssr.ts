// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Scene } from '@nvidia-elements/scene/scene';
import '@nvidia-elements/scene/scene/define.js';

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value -- Scene slots are introduced by this package. */

describe(Scene.metadata.tag, () => {
  it('should render its accessibility structure and fallback slot', async () => {
    const fallback = 'fallback';
    const result = await ssrRunner.render(html`
      <nve-scene aria-label="Robot visualization">
        <p slot=${fallback} nve-text="body">The 3D scene is unavailable.</p>
      </nve-scene>
    `);

    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-scene')).toBe(true);
    expect(result.includes('canvas aria-hidden="true"')).toBe(true);
    expect(result.includes('slot name="description"')).toBe(false);
    expect(result.includes('slot name="fallback"')).toBe(true);
  });
});
