// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Viewport } from '@nvidia-elements/viewport/viewport';
import '@nvidia-elements/viewport/viewport/define.js';

describe(Viewport.metadata.tag, () => {
  it('should render content layers on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-viewport x="10" y="20" scale="2">
        <div>content</div>
      </nve-viewport>
    `);

    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('slot name="background"')).toBe(true);
    expect(result.includes('slot name="overlay"')).toBe(true);
    expect(result.includes('class="plane"')).toBe(true);
    expect(result).toContain('<div>content</div>');
  });
});
