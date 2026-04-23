// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Divider } from '@nvidia-elements/core/divider';
import '@nvidia-elements/core/divider/define.js';

describe(Divider.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-divider></nve-divider>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-divider')).toBe(true);
  });
});
