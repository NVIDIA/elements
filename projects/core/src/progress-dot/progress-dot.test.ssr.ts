// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ProgressDot } from '@nvidia-elements/core/progress-dot';
import '@nvidia-elements/core/progress-dot/define.js';

describe(ProgressDot.metadata.tag, () => {
  it('should render three decorative dots and preserve author configuration', async () => {
    const result = await ssrRunner.render(html`
      <nve-progress-dot size="sm" aria-label="Loading results"></nve-progress-dot>
    `);
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('nve-progress-dot');
    expect(result).toContain('size="sm"');
    expect(result).toContain('aria-label="Loading results"');
    expect(result).toContain('aria-hidden="true"');
    expect(result.match(/<circle /g)).toHaveLength(3);
    expect(result).not.toContain('aria-valuenow');
  });
});
