// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { ToggletipHeader } from '@nvidia-elements/core/toggletip';
import '@nvidia-elements/core/toggletip/define.js';

describe(ToggletipHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ToggletipHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toggletip>
        <nve-toggletip-header>hello</nve-toggletip-header>
      </nve-toggletip>
    `);
    element = fixture.querySelector(ToggletipHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ToggletipHeader.metadata.tag)).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
