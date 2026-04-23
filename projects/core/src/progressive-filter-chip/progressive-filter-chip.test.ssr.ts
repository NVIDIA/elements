// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ProgressiveFilterChip } from '@nvidia-elements/core/progressive-filter-chip';
import '@nvidia-elements/core/progressive-filter-chip/define.js';

describe(ProgressiveFilterChip.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-progressive-filter-chip>
        <select aria-label="select">
          <option value="1">option 1</option>
          <option value="2">option 2</option>
        </select>
        <input type="text" value="text value" aria-label="text input" />
        <input type="date" value="2021-01-01" aria-label="date input" />
      </nve-progressive-filter-chip>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-progressive-filter-chip')).toBe(true);
  });
});
