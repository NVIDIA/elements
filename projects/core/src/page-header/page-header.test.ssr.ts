// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { PageHeader } from '@nvidia-elements/core/page-header';
import '@nvidia-elements/core/page-header/define.js';

describe(PageHeader.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-page-header>
        <h2 nve-text="heading" slot="prefix">header</h2>
      </nve-page-header>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-page-header')).toBe(true);
  });
});
