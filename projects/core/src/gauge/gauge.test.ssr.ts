// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Gauge } from '@nvidia-elements/core/gauge';
import '@nvidia-elements/core/gauge/define.js';

describe(Gauge.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-gauge thumb="needle" value="50"></nve-gauge>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('class="gauge"')).toBe(true);
    expect(result.includes('class="needle"')).toBe(true);
  });
});
