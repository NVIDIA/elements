// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Tooltip } from '@nvidia-elements/core/tooltip';
import '@nvidia-elements/core/tooltip/define.js';

describe(Tooltip.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <button popovertarget="tooltip">button</button>
      <nve-tooltip id="tooltip" closable>hello</nve-tooltip>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-tooltip')).toBe(true);
  });
});
