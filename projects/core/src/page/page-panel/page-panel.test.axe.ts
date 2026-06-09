// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { PagePanel } from '@nvidia-elements/core/page';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(PagePanel.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-page>
        <nve-page-panel id="panel">
          <nve-page-panel-header>panel heading</nve-page-panel-header>
          <nve-icon-button
            slot="actions"
            commandfor="panel"
            command="--close"
            icon-name="cancel"
            aria-label="close panel">
          </nve-icon-button>
          <nve-page-panel-content>panel content</nve-page-panel-content>
          <nve-page-panel-footer>panel footer</nve-page-panel-footer>
        </nve-page-panel>
      </nve-page>
    `);

    await elementIsStable(fixture.querySelector(PagePanel.metadata.tag));
    const results = await runAxe([PagePanel.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
