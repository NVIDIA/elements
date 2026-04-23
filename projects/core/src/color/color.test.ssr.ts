// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Color } from '@nvidia-elements/core/color';
import '@nvidia-elements/core/color/define.js';

describe(Color.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-color>
        <label>label</label>
        <input type="color" />
      </nve-color>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-color')).toBe(true);
  });
});
