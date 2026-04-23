// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Radio } from '@nvidia-elements/core/radio';
import '@nvidia-elements/core/radio/define.js';

describe(Radio.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-radio-group>
        <label>label</label>
        <nve-radio>
          <label>radio 1</label>
          <input type="radio" checked />
        </nve-radio>

        <nve-radio>
          <label>radio 2</label>
          <input type="radio" />
        </nve-radio>

        <nve-radio>
          <label>radio 3</label>
          <input type="radio" />
        </nve-radio>
        <nve-control-message>message</nve-control-message>
      </nve-radio-group>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-radio')).toBe(true);
    expect(result.includes('nve-radio-group')).toBe(true);
  });
});
