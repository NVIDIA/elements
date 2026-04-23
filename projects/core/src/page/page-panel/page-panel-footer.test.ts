// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { PagePanelFooter } from '@nvidia-elements/core/page';
import '@nvidia-elements/core/page/define.js';

describe(PagePanelFooter.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: PagePanelFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-page>
        <nve-page-panel>
          <nve-page-panel-footer>hello</nve-page-panel-footer>
        </nve-page-panel>
      </nve-page>
    `);
    element = fixture.querySelector(PagePanelFooter.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(PagePanelFooter.metadata.tag)).toBeDefined();
  });

  it('should render with the footer default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('footer');
  });
});
