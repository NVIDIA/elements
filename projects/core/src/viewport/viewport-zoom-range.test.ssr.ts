// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ViewportZoomRange } from './viewport-zoom-range.js';
import './define.js';

describe(ViewportZoomRange.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-viewport-zoom-range></nve-viewport-zoom-range>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes(ViewportZoomRange.metadata.tag)).toBe(true);
  });
});
