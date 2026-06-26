// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ProgressGauge } from '@nvidia-elements/core/progress-gauge';
import '@nvidia-elements/core/progress-gauge/define.js';

describe(ProgressGauge.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-progress-gauge value="50"></nve-progress-gauge>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-progress-gauge')).toBe(true);
  });
});
