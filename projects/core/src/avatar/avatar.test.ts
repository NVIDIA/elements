// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { Avatar } from '@nvidia-elements/core/avatar';
import '@nvidia-elements/core/avatar/define.js';

describe(Avatar.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Avatar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-avatar>AV</nve-avatar>
    `);
    element = fixture.querySelector(Avatar.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Avatar.metadata.tag)).toBeDefined();
  });

  it('should reflect size attribute to DOM', async () => {
    expect(element.hasAttribute('size')).toBe(false);
    element.size = 'xs';
    await elementIsStable(element);
    expect(element.getAttribute('size')).toBe('xs');
  });

  it('should reflect color attribute to DOM', async () => {
    expect(element.hasAttribute('color')).toBe(false);
    element.color = 'red-cardinal';
    await elementIsStable(element);
    expect(element.getAttribute('color')).toBe('red-cardinal');
  });
});
