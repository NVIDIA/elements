// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Breadcrumb } from '@nvidia-elements/core/breadcrumb';
import '@nvidia-elements/core/breadcrumb/define.js';

describe(Breadcrumb.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-breadcrumb>
        <span>Static item</span>
        <span>Static item</span>
        <span>Static item</span>
      </nve-breadcrumb>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-breadcrumb')).toBe(true);
  });
});
