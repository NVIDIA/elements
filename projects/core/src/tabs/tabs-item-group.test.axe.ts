// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe('nve-tabs-item-group', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe with explicit tab and accessory roles', async () => {
    fixture = await createFixture(html`
      <nve-tabs role="tablist" aria-label="Experiments">
        <nve-tabs-item-group>
          <nve-tabs-item role="tab" selected aria-controls="experiment-panel" id="experiment-tab">
            <span slot="prefix" aria-hidden="true">●</span>Experiment
          </nve-tabs-item>
          <nve-icon-button role="button" slot="suffix" icon-name="cancel" size="sm" aria-label="Close experiment"></nve-icon-button>
        </nve-tabs-item-group>
        <nve-tabs-item-group>
          <button slot="prefix" type="button" aria-label="Pin comparison" aria-pressed="false">Pin</button>
          <nve-tabs-item role="tab" aria-label="Comparison label">Comparison label</nve-tabs-item>
        </nve-tabs-item-group>
        <nve-tabs-item-group>
          <nve-tabs-item role="tab" aria-labelledby="unavailable-label" disabled>
            <span id="unavailable-label">Unavailable</span>
          </nve-tabs-item>
          <button slot="suffix" type="button" disabled>Close unavailable</button>
        </nve-tabs-item-group>
      </nve-tabs>
      <div role="tabpanel" id="experiment-panel" aria-labelledby="experiment-tab">Experiment panel</div>
    `);
    await Promise.all(
      Array.from(
        fixture.querySelectorAll<HTMLElement>('nve-tabs,nve-tabs-item-group,nve-tabs-item,nve-icon-button')
      ).map(element => elementIsStable(element))
    );

    const results = await runAxe(['nve-tabs', '#experiment-panel'], {
      rules: {
        'color-contrast': { enabled: false },
        // Accepted accessibility exception: sibling actions within a tablist.
        // W3C aria#2322 reports successful screen reader testing of this structure.
        // Revisit when ARIA/axe guidance changes or testing reveals usability issues.
        // https://github.com/w3c/aria/issues/2322
        'aria-required-children': { enabled: false }
      }
    });

    expect(results.violations).toEqual([]);
    expect(results.passes.some(result => result.id === 'nested-interactive')).toBe(true);
    expect(results.passes.some(result => result.id === 'aria-required-parent')).toBe(true);
  });
});
