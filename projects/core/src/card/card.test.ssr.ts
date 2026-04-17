// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Card } from '@nvidia-elements/core/card';
import '@nvidia-elements/core/card/define.js';

describe(Card.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-card>
        <nve-card-header>heading</nve-card-header>
        <nve-card-content>content</nve-card-content>
        <nve-card-footer>footer</nve-card-footer>
      </nve-card>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-card')).toBe(true);
  });
});
