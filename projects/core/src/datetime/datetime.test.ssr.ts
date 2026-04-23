// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Datetime } from '@nvidia-elements/core/datetime';
import '@nvidia-elements/core/datetime/define.js';

describe(Datetime.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-datetime>
        <label>label</label>
        <input type="datetime-local" />
      </nve-datetime>  
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-datetime')).toBe(true);
  });
});
