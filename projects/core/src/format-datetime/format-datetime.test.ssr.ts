// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { FormatDatetime } from '@nvidia-elements/core/format-datetime';
import '@nvidia-elements/core/format-datetime/define.js';

describe(FormatDatetime.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(
      html`<nve-format-datetime date-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>`
    );
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-format-datetime')).toBe(true);
  });
});
