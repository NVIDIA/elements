// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Plot } from '@nvidia-elements/plot/plot';
import '@nvidia-elements/plot/plot/define.js';

describe(Plot.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-plot></nve-plot>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-plot')).toBe(true);
  });
});
