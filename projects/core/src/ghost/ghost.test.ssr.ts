// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import '@nvidia-elements/core/ghost/define.js';

describe('ghost SSR', () => {
  it('renders inert presentation without client lifecycle work', async () => {
    const result = await ssrRunner.render(html` <nve-ghost> <span slot="label">Editor</span>Preview</nve-ghost> `);
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('inert');
    expect(result).toContain('aria-hidden="true"');
    expect(result).toContain('Preview');
  });
});
