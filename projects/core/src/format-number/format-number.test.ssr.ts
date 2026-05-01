// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { FormatNumber } from '@nvidia-elements/core/format-number';
import '@nvidia-elements/core/format-number/define.js';

describe(FormatNumber.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(
      html`<nve-format-number format-style="currency" currency="USD">1234.56</nve-format-number>`
    );
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-format-number')).toBe(true);
  });
});
