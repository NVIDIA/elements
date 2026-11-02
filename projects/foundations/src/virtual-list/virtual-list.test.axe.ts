// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { VirtualList } from '@nvidia-elements/foundations/virtual-list';
import '@nvidia-elements/foundations/virtual-list/define.js';

describe(VirtualList.metadata.tag, () => {
  it.each([1, 10000])('preserves standalone content semantics with %s items', async count => {
    const fixture = await createFixture(
      html`<nve-virtual-list item-count="1" item-height="40" style="--scroll-height: 200px"><div style="height:40px">Activity</div></nve-virtual-list>`
    );
    const list = fixture.querySelector<VirtualList>('nve-virtual-list')!;
    await elementIsStable(list);
    list.itemCount = count;
    await elementIsStable(list);
    try {
      expect((await runAxe(['nve-virtual-list'])).violations).toHaveLength(0);
    } finally {
      removeFixture(fixture);
    }
  });
});
