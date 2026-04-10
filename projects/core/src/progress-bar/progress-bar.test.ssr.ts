// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ProgressBar } from '@nvidia-elements/core/progress-bar';
import '@nvidia-elements/core/progress-bar/define.js';

describe(ProgressBar.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-progress-bar value="50"></nve-progress-bar>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-progress-bar')).toBe(true);
  });
});
