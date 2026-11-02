// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { VirtualList } from '@nvidia-elements/foundations/virtual-list';
import '@nvidia-elements/foundations/virtual-list/define.js';

describe(VirtualList.metadata.tag, () => {
  it('renders hidden uncommitted content without browser measurements', async () => {
    const result = await ssrRunner.render(
      html`<nve-virtual-list item-count="10000" item-height="40"><div>Activity</div></nve-virtual-list>`
    );
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('Activity');
    expect(result).toContain('class="content" hidden');
  });
});
