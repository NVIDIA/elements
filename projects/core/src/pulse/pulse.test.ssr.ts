// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Pulse } from '@nvidia-elements/core/pulse';
import '@nvidia-elements/core/pulse/define.js';

describe(Pulse.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-pulse></nve-pulse>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-pulse')).toBe(true);
  });
});
