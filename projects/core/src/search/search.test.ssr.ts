// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Search } from '@nvidia-elements/core/search';
import '@nvidia-elements/core/search/define.js';

describe(Search.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-search>
        <label>label</label>
        <input type="search" />
      </nve-search>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-search')).toBe(true);
  });
});
