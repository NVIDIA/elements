// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { DropdownFooter } from '@nvidia-elements/core/dropdown';
import '@nvidia-elements/core/dropdown/define.js';

describe(DropdownFooter.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DropdownFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dropdown>
        <nve-dropdown-footer>hello</nve-dropdown-footer>
      </nve-dropdown>
    `);
    element = fixture.querySelector(DropdownFooter.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(DropdownFooter.metadata.tag)).toBeDefined();
  });

  it('should render with the footer default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('footer');
  });
});
