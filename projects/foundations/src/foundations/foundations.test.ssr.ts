// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Foundations } from '@nvidia-elements/foundations/foundations';
import '@nvidia-elements/foundations/foundations/define.js';

describe(Foundations.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(
      html`<nve-foundations><p nve-text="body">Container content</p></nve-foundations>`
    );
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-foundations')).toBe(true);
    expect(result.includes('<slot></slot>')).toBe(true);
    expect(result.includes('Container content')).toBe(true);
  });
});
