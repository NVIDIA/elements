// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Toggletip } from '@nvidia-elements/core/toggletip';
import '@nvidia-elements/core/toggletip/define.js';

describe(Toggletip.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <button popovertarget="toggletip">button</button>
      <nve-toggletip id="toggletip" closable>hello</nve-toggletip>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-toggletip')).toBe(true);
  });
});
