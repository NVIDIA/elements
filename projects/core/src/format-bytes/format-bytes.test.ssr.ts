// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { FormatBytes } from '@nvidia-elements/core/format-bytes';
import '@nvidia-elements/core/format-bytes/define.js';

describe(FormatBytes.metadata.tag, () => {
  it('should render formatted semantic output during ssr', async () => {
    const result = await ssrRunner.render(html`<nve-format-bytes locale="en-US" value="1048576"></nve-format-bytes>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('<data internal-host value="1048576">')).toBe(true);
    expect(result.includes('1.05 MB')).toBe(true);
    expect(result.includes('nve-format-bytes')).toBe(true);
  });
});
