// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { DropdownHeader } from '@nvidia-elements/core/dropdown';
import '@nvidia-elements/core/dropdown/define.js';

describe(DropdownHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DropdownHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dropdown>
        <nve-dropdown-header>hello</nve-dropdown-header>
      </nve-dropdown>
    `);
    element = fixture.querySelector(DropdownHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(DropdownHeader.metadata.tag)).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
