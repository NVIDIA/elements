// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { MediaPlaybackRateSelect } from './playback-rate-select.js';
import './define.js';

describe(MediaPlaybackRateSelect.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-media-playback-rate-select></nve-media-playback-rate-select>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes(MediaPlaybackRateSelect.metadata.tag)).toBe(true);
  });
});
