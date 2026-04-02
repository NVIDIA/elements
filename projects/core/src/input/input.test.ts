// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { Input } from '@nvidia-elements/core/input';
import '@nvidia-elements/core/input/define.js';

describe(Input.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Input;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-input>
        <label>label</label>
        <input type="text" />
      </nve-input>
    `);
    element = fixture.querySelector(Input.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Input.metadata.tag)).toBeDefined();
  });

  it('should have a flat container option', async () => {
    expect(element.container).toBe(undefined);
    element.container = 'flat';
    await elementIsStable(element);
    expect(element.container).toBe('flat');
    expect(element.hasAttribute('container')).toBe(true);
  });

  it('should reset input value to initial attribute value via reset()', async () => {
    const input = fixture.querySelector('input');
    input.setAttribute('value', 'initial');
    input.value = 'changed';
    expect(input.value).toBe('changed');

    const event = untilEvent(element, 'reset');
    element.reset();
    const e = await event;
    expect(e).toBeDefined();
    expect(input.value).toBe('initial');
  });

  it('should reset input value to empty string when no initial value attribute', async () => {
    const input = fixture.querySelector('input');
    input.value = 'typed';
    expect(input.value).toBe('typed');

    element.reset();
    await elementIsStable(element);
    expect(input.value).toBe('');
  });
});
