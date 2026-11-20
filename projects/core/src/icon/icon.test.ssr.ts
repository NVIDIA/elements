// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon/icons/person.js';

describe(Icon.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-icon name="add"></nve-icon>
      <nve-icon name="person"></nve-icon>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-icon')).toBe(true);
    expect(result.includes('lucide-user')).toBe(true);
  });

  it('should server render eagerly registered outline and solid SVGs', async () => {
    await Icon.add({
      'test:accelerator': '<svg class="accelerator-outline" viewBox="0 0 16 16"></svg>',
      'test:accelerator-solid': '<svg class="accelerator-solid" viewBox="0 0 16 16"></svg>'
    });

    const outline = await ssrRunner.render(html`<nve-icon name="test:accelerator"></nve-icon>`);
    const solid = await ssrRunner.render(html`<nve-icon name="test:accelerator" appearance="solid"></nve-icon>`);

    expect(outline).toContain('class="accelerator-outline"');
    expect(solid).toContain('class="accelerator-solid"');
  });
});
