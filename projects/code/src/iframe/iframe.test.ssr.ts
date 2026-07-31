// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Iframe } from '@nvidia-elements/code/iframe';
import '@nvidia-elements/code/iframe/define.js';

describe(Iframe.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-iframe>
        <template slot="head"><title>Iframe SSR test</title></template>
        <template><p nve-text="body">Iframe SSR content</p></template>
      </nve-iframe>
    `);

    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-iframe')).toBe(true);
    expect(result.includes('sandbox="allow-scripts"')).toBe(true);
    expect(result.includes('allow-same-origin')).toBe(false);
  });
});
