// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { ToggletipFooter } from '@nvidia-elements/core/toggletip';
import '@nvidia-elements/core/toggletip/define.js';

describe(ToggletipFooter.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ToggletipFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toggletip>
        <nve-toggletip-footer>hello</nve-toggletip-footer>
      </nve-toggletip>
    `);
    element = fixture.querySelector(ToggletipFooter.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ToggletipFooter.metadata.tag)).toBeDefined();
  });

  it('should render with the footer default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('footer');
  });
});
