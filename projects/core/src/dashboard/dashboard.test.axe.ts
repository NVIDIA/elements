// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';

import { Dashboard } from '@nvidia-elements/core/dashboard';

import '@nvidia-elements/core/dashboard/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(Dashboard.metadata.tag, () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dashboard
        aria-label="Test analysis"
        rearrangeable
        fullscreenable
        style="width:720px;height:320px;--animation-duration:0ms"
        value='{"version":1,"grid":{"flow":"vertical","tracks":4},"items":[{"id":"notes","column":0,"row":0,"columnSpan":2,"rowSpan":2},{"id":"summary","column":2,"row":0,"columnSpan":2,"rowSpan":2}]}'>
        <nve-dashboard-panel id="notes">
          <nve-dashboard-panel-header>
            Notes
            <nve-icon-button slot="suffix" icon-name="more-actions" aria-label="Notes actions"></nve-icon-button>
          </nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <label>Investigation notes</label>
              <input value="Inspect regression" />
            </nve-input>
          </nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>
            Draft notes
            <nve-button slot="suffix">Save notes</nve-button>
          </nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="summary">
          <nve-dashboard-panel-header>Summary</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Twelve cases need review.</nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
    `);
    await elementIsStable(fixture.querySelector(Dashboard.metadata.tag)!);
  });

  afterEach(() => removeFixture(fixture));

  it('should pass axe check', async () => {
    const results = await runAxe([Dashboard.metadata.tag]);

    expect(results.violations.length).toBe(0);
  });
});
