// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Viewport } from '@nvidia-elements/core/viewport';
import '@nvidia-elements/core/viewport/define.js';

describe(Viewport.metadata.tag, () => {
  it('should render both content slots and assign gridlines on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-viewport x="10" y="20" scale="2">
        <nve-viewport-gridlines></nve-viewport-gridlines>
        <div>content</div>
      </nve-viewport>
    `);

    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('slot name="background"')).toBe(true);
    expect(result.includes('class="plane"')).toBe(true);
    const gridlinesTag = result.match(/<nve-viewport-gridlines\b[^>]*>/)?.[0];
    expect(gridlinesTag).toBeDefined();
    expect(gridlinesTag).toContain('slot="background"');
    expect(gridlinesTag).toContain('aria-hidden="true"');
  });
});
