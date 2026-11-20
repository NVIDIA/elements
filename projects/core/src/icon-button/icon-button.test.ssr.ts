// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Icon } from '@nvidia-elements/core/icon';
import { IconButton } from '@nvidia-elements/core/icon-button';
import '@nvidia-elements/core/icon-button/define.js';

describe(IconButton.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-icon-button icon-name="add"></nve-icon-button>
      <nve-icon-button icon-name="person"></nve-icon-button>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-icon-button')).toBe(true);
  });

  it('should server render an eagerly registered icon', async () => {
    await Icon.add({ 'test:device': '<svg class="device-outline" viewBox="0 0 16 16"></svg>' });

    const result = await ssrRunner.render(
      html`<nve-icon-button icon-name="test:device" aria-label="Device settings"></nve-icon-button>`
    );

    expect(result).toContain('class="device-outline"');
  });
});
