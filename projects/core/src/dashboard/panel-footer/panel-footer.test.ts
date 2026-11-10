// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { DashboardPanelFooter } from '@nvidia-elements/core/dashboard';

import '@nvidia-elements/core/dashboard/define.js';

describe(DashboardPanelFooter.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DashboardPanelFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dashboard-panel>
        <nve-dashboard-panel-footer>
          <span>Application content</span>
        </nve-dashboard-panel-footer>
      </nve-dashboard-panel>
    `);
    element = fixture.querySelector<DashboardPanelFooter>('nve-dashboard-panel-footer')!;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(DashboardPanelFooter.metadata.tag)).toBeDefined();
  });

  it('should project supplied content through its default slot', () => {
    const slot = element.shadowRoot!.querySelector('slot')!;

    expect(slot.assignedElements()).toEqual([element.querySelector('span')]);
  });

  it('should assign itself to the footer slot', () => {
    expect(element.slot).toBe('footer');
  });
});
