// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { PagePanel } from '@nvidia-elements/core/page';
import '@nvidia-elements/core/page/define.js';

describe(PagePanel.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-page>
        <nve-page-panel id="panel" hidden>
          <nve-page-panel-header>panel heading</nve-page-panel-header>
          <button slot="actions" commandfor="panel" command="--open">open</button>
          <nve-page-panel-content>panel content</nve-page-panel-content>
          <nve-page-panel-footer>panel footer</nve-page-panel-footer>
        </nve-page-panel>
      </nve-page>
    `);

    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes(PagePanel.metadata.tag)).toBe(true);
    expect(result.includes('command="--open"')).toBe(true);
  });
});
