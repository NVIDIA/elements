// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { PageLoader } from '@nvidia-elements/core/page-loader';
import '@nvidia-elements/core/page-loader/define.js';

describe(PageLoader.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-page-loader></nve-page-loader>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-page-loader')).toBe(true);
  });
});
