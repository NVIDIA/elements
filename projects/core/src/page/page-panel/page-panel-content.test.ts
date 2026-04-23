// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { PagePanelContent } from '@nvidia-elements/core/page';
import '@nvidia-elements/core/page/define.js';

describe(PagePanelContent.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: PagePanelContent;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-page>
        <nve-page-panel>
          <nve-page-panel-content>hello</nve-page-panel-content>
        </nve-page-panel>
      </nve-page>
    `);
    element = fixture.querySelector(PagePanelContent.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(PagePanelContent.metadata.tag)).toBeDefined();
  });
});
