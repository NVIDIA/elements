// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { FormatRelativeTime } from '@nvidia-elements/core/format-relative-time';
import '@nvidia-elements/core/format-relative-time/define.js';

describe(FormatRelativeTime.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(
      html`<nve-format-relative-time date="2023-07-27T12:00:00.000Z"></nve-format-relative-time>`
    );
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-format-relative-time')).toBe(true);
  });
});
