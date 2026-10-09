// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ViewportMinimap } from '@nvidia-elements/viewport/minimap';
import '@nvidia-elements/viewport/viewport/define.js';
import '@nvidia-elements/viewport/minimap/define.js';

describe(ViewportMinimap.metadata.tag, () => {
  it('should render in the overlay slot on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-viewport x="10" y="20" scale="2">
        <nve-viewport-minimap></nve-viewport-minimap>
        <div>content</div>
      </nve-viewport>
    `);

    const tag = result.match(/<nve-viewport-minimap\b[^>]*>/)?.[0];
    expect(tag).toBeDefined();
    expect(tag).toContain('slot="overlay"');
    expect(tag).toContain('aria-hidden="true"');
    expect(result.match(/shadowroot="open"/g)).toHaveLength(2);
  });
});
