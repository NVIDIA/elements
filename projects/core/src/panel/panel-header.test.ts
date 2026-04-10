// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { PanelHeader } from '@nvidia-elements/core/panel';
import '@nvidia-elements/core/panel/define.js';

describe(PanelHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: PanelHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-panel>
        <nve-panel-header>hello</nve-panel-header>
      </nve-panel>
    `);
    element = fixture.querySelector(PanelHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(PanelHeader.metadata.tag)).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
