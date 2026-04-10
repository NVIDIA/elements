// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Sparkline } from '@nvidia-elements/core/sparkline';
import '@nvidia-elements/core/sparkline/define.js';

describe(Sparkline.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(
      html`<nve-sparkline .data=${[1, 2, 3]} aria-label="sparkline"></nve-sparkline>`
    );
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-sparkline')).toBe(true);
  });
});
