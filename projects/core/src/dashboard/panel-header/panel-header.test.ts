// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { DashboardPanelHeader } from '../index.js';

import '../define.js';

describe(DashboardPanelHeader.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }
  });

  it('assigns the header slot and preserves application content', async () => {
    fixture = await createFixture(
      html`<nve-dashboard-panel><nve-dashboard-panel-header><span slot="prefix">Icon</span>Title<button slot="suffix">Action</button></nve-dashboard-panel-header></nve-dashboard-panel>`
    );

    const header = fixture.querySelector('nve-dashboard-panel-header')!;

    await elementIsStable(header);

    expect(header.slot).toBe('header');
    expect(header.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="suffix"]')!.assignedElements()).toEqual([
      header.querySelector('button')
    ]);
  });
});
