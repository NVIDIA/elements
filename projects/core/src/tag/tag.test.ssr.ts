// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Tag } from '@nvidia-elements/core/tag';
import '@nvidia-elements/core/tag/define.js';

describe(Tag.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-tag></nve-tag>
      <nve-tag closable>closable</nve-tag>
      <nve-tag color="red-cardinal">red-cardinal</nve-tag>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-tag')).toBe(true);
  });
});
