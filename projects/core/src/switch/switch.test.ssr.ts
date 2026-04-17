// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Switch } from '@nvidia-elements/core/switch';
import '@nvidia-elements/core/switch/define.js';

describe(Switch.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-switch-group>
        <nve-switch>
          <label>label</label>
          <input type="checkbox" />
        </nve-switch>
        <nve-switch>
          <label>label</label>
          <input type="checkbox" />
        </nve-switch>
      </nve-switch-group>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-switch')).toBe(true);
  });
});
