// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ScrollBox } from '@nvidia-elements/core/scroll-box';
import '@nvidia-elements/core/scroll-box/define.js';

describe(ScrollBox.metadata.tag, () => {
  it.each([false, true])('should render without browser measurements with scroll shadows %s', async shadows => {
    const result = await ssrRunner.render(html`
      <nve-scroll-box orientation="vertical" ?scroll-shadow=${shadows} aria-label="Activity">
        <p nve-text="body">Activity content</p>
      </nve-scroll-box>
    `);
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('nve-scroll-box');
    expect(result).toContain('Activity content');
    expect(result).not.toMatch(/<nve-scroll-box\b[^>]*\btabindex=/);
    expect(result.includes('class="shadow-layer"')).toBe(shadows);
  });
});
