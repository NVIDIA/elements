// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { CopyButton } from '@nvidia-elements/core/copy-button';
import '@nvidia-elements/core/copy-button/define.js';

describe(CopyButton.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-copy-button value="copy button"></nve-copy-button>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-copy-button')).toBe(true);
  });
});
