// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ViewportGridlines } from '@nvidia-elements/viewport/gridlines';
import '@nvidia-elements/viewport/viewport/define.js';
import '@nvidia-elements/viewport/gridlines/define.js';

describe(ViewportGridlines.metadata.tag, () => {
  it('should render in the background slot on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-viewport x="10" y="20" scale="2">
        <nve-viewport-gridlines></nve-viewport-gridlines>
        <div>content</div>
      </nve-viewport>
    `);

    const tag = result.match(/<nve-viewport-gridlines\b[^>]*>/)?.[0];
    expect(tag).toBeDefined();
    expect(tag).toContain('slot="background"');
    expect(tag).toContain('aria-hidden="true"');
    expect(result.match(/shadowroot="open"/g)).toHaveLength(2);
  });
});
