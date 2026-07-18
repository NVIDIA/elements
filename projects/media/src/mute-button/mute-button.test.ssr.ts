// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { MediaMuteButton } from './mute-button.js';
import './define.js';

describe(MediaMuteButton.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-media-mute-button></nve-media-mute-button>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes(MediaMuteButton.metadata.tag)).toBe(true);
  });
});
