// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Toast } from '@nvidia-elements/core/toast';
import '@nvidia-elements/core/toast/define.js';

describe(Toast.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <button popovertarget="toast">button</button>
      <nve-toast id="toast" closable>hello</nve-toast>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-toast')).toBe(true);
  });
});
