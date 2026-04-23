// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Drawer } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/drawer/define.js';

describe(Drawer.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <button popovertarget="dropdown">button</button>
      <nve-drawer id="dropdown" closable>hello</nve-drawer>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-drawer')).toBe(true);
  });
});
