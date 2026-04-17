// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { Radio } from '@nvidia-elements/core/radio';
import '@nvidia-elements/core/radio/define.js';

describe(Radio.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Radio;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-radio>
        <label>label</label>
        <input type="radio" />
      </nve-radio>
    `);
    element = fixture.querySelector(Radio.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Radio.metadata.tag)).toBeDefined();
  });

  it('should add :state(checked) when input is clicked', async () => {
    const input = fixture.querySelector('input');
    expect(element.matches(':state(checked)')).toBe(false);

    input.click();
    await elementIsStable(element);
    expect(element.matches(':state(checked)')).toBe(true);
  });
});

describe(`${Radio.metadata.tag} - radio group`, () => {
  let fixture: HTMLElement;
  let radio1: Radio;
  let radio2: Radio;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-radio-group>
        <label>group</label>
        <nve-radio>
          <label>option 1</label>
          <input type="radio" name="test-group" />
        </nve-radio>
        <nve-radio>
          <label>option 2</label>
          <input type="radio" name="test-group" />
        </nve-radio>
      </nve-radio-group>
    `);
    const radios = fixture.querySelectorAll<Radio>(Radio.metadata.tag);
    radio1 = radios[0];
    radio2 = radios[1];
    await elementIsStable(radio1);
    await elementIsStable(radio2);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should deselect first radio when second is clicked in same group', async () => {
    const input1 = radio1.querySelector('input');
    const input2 = radio2.querySelector('input');

    input1.click();
    await elementIsStable(radio1);
    expect(radio1.matches(':state(checked)')).toBe(true);
    expect(radio2.matches(':state(checked)')).toBe(false);

    input2.click();
    await elementIsStable(radio1);
    await elementIsStable(radio2);
    expect(radio1.matches(':state(checked)')).toBe(false);
    expect(radio2.matches(':state(checked)')).toBe(true);
  });
});
