// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { MediaTimeRange } from './time-range.js';
import './define.js';

describe(MediaTimeRange.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-media-time-range></nve-media-time-range>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes(MediaTimeRange.metadata.tag)).toBe(true);
  });
});
