// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { FormControlMixin } from '@nvidia-elements/forms/mixin';
import { Checkbox } from '@nvidia-elements/core/checkbox';
import '@nvidia-elements/core/checkbox/define.js';

describe(Checkbox.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Checkbox;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-checkbox>
        <label>label</label>
        <input type="checkbox" />
      </nve-checkbox>
    `);
    element = fixture.querySelector(Checkbox.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Checkbox.metadata.tag)).toBeDefined();
  });

  it('should add :state(checked) when input is clicked', async () => {
    const input = fixture.querySelector('input');
    expect(element.matches(':state(checked)')).toBe(false);

    input.click();
    await elementIsStable(element);
    expect(element.matches(':state(checked)')).toBe(true);
  });

  it('should remove :state(checked) when input is unchecked', async () => {
    const input = fixture.querySelector('input');
    input.click();
    await elementIsStable(element);
    expect(element.matches(':state(checked)')).toBe(true);

    input.click();
    await elementIsStable(element);
    expect(element.matches(':state(checked)')).toBe(false);
  });

  it('should add :state(indeterminate) when input is set to indeterminate', async () => {
    const input = fixture.querySelector('input');
    expect(element.matches(':state(indeterminate)')).toBe(false);

    input.indeterminate = true;
    await elementIsStable(element);
    expect(element.matches(':state(indeterminate)')).toBe(true);
  });
});

describe(`${Checkbox.metadata.tag} - control base behavior`, () => {
  let fixture: HTMLElement;
  let element: Checkbox;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-checkbox>
        <label>label</label>
        <input type="checkbox" value="on" />
      </nve-checkbox>
    `);
    element = fixture.querySelector(Checkbox.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should dispatch reset event with bubbles and composed via reset()', async () => {
    const event = untilEvent(element, 'reset');
    element.reset();
    const e = await event;
    expect(e).toBeDefined();
    expect((e as Event).bubbles).toBe(true);
    expect((e as Event).composed).toBe(true);
  });

  it('should disconnect observers when removed from DOM', async () => {
    const input = fixture.querySelector('input');
    expect(element.matches(':state(checked)')).toBe(false);

    // verify observers are active
    input.click();
    await elementIsStable(element);
    expect(element.matches(':state(checked)')).toBe(true);

    // remove from DOM
    element.remove();

    // re-add to DOM and verify it reconnects properly
    fixture.appendChild(element);
    await elementIsStable(element);
    expect(element.isConnected).toBe(true);
  });
});

class TestFormContainer extends FormControlMixin<typeof LitElement, Record<string, unknown>>(LitElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'test-form-container',
    valueSchema: {
      type: 'object' as const,
      properties: {},
      required: []
    }
  };

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('test-form-container', TestFormContainer);

// This test ensures that a slotted form control and its events are not interfered with by another parent form control type
describe(`${Checkbox.metadata.tag} - nested in FormControlMixin container`, () => {
  let fixture: HTMLElement;
  let container: TestFormContainer;
  let element: Checkbox;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <test-form-container>
        <nve-checkbox>
          <label>label</label>
          <input type="checkbox" />
        </nve-checkbox>
      </test-form-container>
    `);
    container = fixture.querySelector('test-form-container')!;
    await container.updateComplete;
    element = fixture.querySelector(Checkbox.metadata.tag)!;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync :state(checked) when slotted inside a FormControlMixin host', async () => {
    const input = fixture.querySelector('input')!;
    expect(element.matches(':state(checked)')).toBe(false);

    input.click();
    await elementIsStable(element);
    expect(element.matches(':state(checked)')).toBe(true);

    input.click();
    await elementIsStable(element);
    expect(element.matches(':state(checked)')).toBe(false);
  });
});
