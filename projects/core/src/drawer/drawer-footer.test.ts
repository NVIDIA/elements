// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { DrawerFooter } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/drawer/define.js';

describe(DrawerFooter.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DrawerFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-drawer>
        <nve-drawer-footer>hello</nve-drawer-footer>
      </nve-drawer>
    `);
    element = fixture.querySelector(DrawerFooter.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(DrawerFooter.metadata.tag)).toBeDefined();
  });

  it('should render with the footer default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('footer');
  });
});
