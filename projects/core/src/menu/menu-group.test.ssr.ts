// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { MenuGroup } from '@nvidia-elements/core/menu';
import '@nvidia-elements/core/menu/define.js';

describe(MenuGroup.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-menu-group expanded>
        Resources
        <nve-menu slot="menu">
          <nve-menu-item>Documentation</nve-menu-item>
        </nve-menu>
      </nve-menu-group>
    `);

    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-menu-group')).toBe(true);
    expect(result.includes('nve-menu')).toBe(true);
    expect(result.includes('slot="menu"')).toBe(true);
    expect(result.includes('aria-controls="content"')).toBe(true);
  });
});
