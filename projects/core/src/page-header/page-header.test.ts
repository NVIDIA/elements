// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { PageHeader } from '@nvidia-elements/core/page-header';
import '@nvidia-elements/core/page-header/define.js';

describe(PageHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: PageHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-page-header></nve-page-header>
    `);
    element = fixture.querySelector(PageHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(PageHeader.metadata.tag)).toBeDefined();
  });

  it('should have navigation role', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('navigation');
  });

  it('should provide prefix, default, and suffix slots', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name="prefix"]')).toBeTruthy();
    expect(element.shadowRoot.querySelector('slot:not([name])')).toBeTruthy();
    expect(element.shadowRoot.querySelector('slot[name="suffix"]')).toBeTruthy();
  });
});
