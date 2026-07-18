// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { MediaVolumeRange } from './volume-range.js';
import './define.js';

describe(MediaVolumeRange.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-media-volume-range></nve-media-volume-range>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes(MediaVolumeRange.metadata.tag)).toBe(true);
  });
});
