// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Logo } from '@nvidia-elements/core/logo';
import '@nvidia-elements/core/logo/define.js';

describe(Logo.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-logo></nve-logo>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-logo')).toBe(true);
  });
});
