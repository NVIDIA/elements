// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Toolbar } from '@nvidia-elements/core/toolbar';
import '@nvidia-elements/core/toolbar/define.js';

describe(Toolbar.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-toolbar></nve-toolbar>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-toolbar')).toBe(true);
  });
});
