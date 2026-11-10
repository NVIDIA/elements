// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { DashboardPanel } from '../index.js';

import '../define.js';

describe(DashboardPanel.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }
  });

  it('reflects constraints so its parent observes property and attribute changes equally', async () => {
    fixture = await createFixture(
      html`<nve-dashboard-panel><nve-dashboard-panel-header>Title</nve-dashboard-panel-header></nve-dashboard-panel>`
    );

    const panel = fixture.querySelector('nve-dashboard-panel')!;

    panel.minColumnSpan = 2;
    panel.moveDisabled = true;
    await elementIsStable(panel);

    expect(panel.getAttribute('min-column-span')).toBe('2');
    expect(panel.hasAttribute('move-disabled')).toBe(true);
  });

  it('keeps authored header, body and footer in their own slots', async () => {
    fixture = await createFixture(
      html`<nve-dashboard-panel><nve-dashboard-panel-header>Title</nve-dashboard-panel-header><input value="kept" /><nve-dashboard-panel-footer>Status</nve-dashboard-panel-footer></nve-dashboard-panel>`
    );

    const panel = fixture.querySelector('nve-dashboard-panel')!;

    await elementIsStable(panel);

    expect(panel.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!.assignedElements()).toEqual([
      panel.querySelector('input')
    ]);
    expect(panel.querySelector('nve-dashboard-panel-footer')!.slot).toBe('footer');
  });

  it('includes default-slot title content and excludes named-slot content from the panel name', async () => {
    fixture = await createFixture(html`
      <nve-dashboard-panel id="revenue">
        <nve-dashboard-panel-header><span slot="prefix">Status</span>Monthly <span slot="">Revenue</span><button slot="suffix">Actions</button></nve-dashboard-panel-header>
      </nve-dashboard-panel>
    `);

    const panel = fixture.querySelector('nve-dashboard-panel')!;
    const unassigned = document.createElement('span');

    unassigned.slot = 'unknown';
    unassigned.textContent = 'Hidden details';
    panel.querySelector('nve-dashboard-panel-header')!.append(unassigned);

    await elementIsStable(panel);

    expect(panel._getLabel()).toBe('Monthly Revenue');
  });
});
