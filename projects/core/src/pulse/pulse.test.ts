// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { Pulse } from '@nvidia-elements/core/pulse';
import '@nvidia-elements/core/pulse/define.js';

describe(Pulse.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Pulse;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-pulse></nve-pulse>
    `);
    element = fixture.querySelector(Pulse.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Pulse.metadata.tag)).toBeDefined();
  });

  it('should reflect size attribute to DOM', async () => {
    expect(element.hasAttribute('size')).toBe(false);
    element.size = 'xs';
    await elementIsStable(element);
    expect(element.getAttribute('size')).toBe('xs');
  });

  it('should reflect status attribute to DOM', async () => {
    expect(element.hasAttribute('status')).toBe(false);
    element.status = 'warning';
    await elementIsStable(element);
    expect(element.getAttribute('status')).toBe('warning');
  });

  it('should provide a aria role of alert to describe content', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('alert');
  });

  it('should render SVG with 4 circle elements', async () => {
    await elementIsStable(element);
    const circles = element.shadowRoot.querySelectorAll('circle');
    expect(circles.length).toBe(4);
  });
});
