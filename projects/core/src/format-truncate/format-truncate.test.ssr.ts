// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { FormatTruncate } from '@nvidia-elements/core/format-truncate';
import '@nvidia-elements/core/format-truncate/define.js';

describe(FormatTruncate.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(
      html`<nve-format-truncate position="center" preserve="4">abcdefghij</nve-format-truncate>`
    );

    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-format-truncate')).toBe(true);
    expect(result.includes('abcdefghij')).toBe(true);
  });
});
