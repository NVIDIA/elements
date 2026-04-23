// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { stateSelected } from '@nvidia-elements/core/internal';

@stateSelected<StateSelectedControllerTestElement>()
@customElement('state-selected-controller-test-element')
class StateSelectedControllerTestElement extends LitElement {
  @property({ type: Boolean }) selected: boolean;
  @property({ type: Boolean }) readonly: boolean;
  declare _internals: ElementInternals;

  render() {
    return html`<slot></slot>`;
  }
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 */
describe('state-selected.controller', () => {
  let element: StateSelectedControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-selected-controller-test-element></state-selected-controller-test-element>`
    );
    element = fixture.querySelector<StateSelectedControllerTestElement>('state-selected-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize aria-selected as null', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe(null);
    expect(element.matches(':state(selected)')).toBe(false);
  });

  it('should initialize aria-selected as null if selected not applied', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe(null);
    expect(element.matches(':state(selected)')).toBe(false);
  });

  it('should initialize aria-selected as true if selected applied', async () => {
    element.selected = true;
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe('true');
    expect(element.matches(':state(selected)')).toBe(true);
  });

  it('should initialize aria-selected as false if selected=false is applied', async () => {
    element.selected = false;
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe('false');
    expect(element.matches(':state(selected)')).toBe(false);
  });

  it('should remove aria-selected if readonly', async () => {
    element.selected = true;
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe('true');
    expect(element.matches(':state(selected)')).toBe(true);

    element.readonly = true;
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe(null);
    expect(element.matches(':state(selected)')).toBe(false);
  });

  it('should appply aria-current="page" if a selected anchor', async () => {
    const a = document.createElement('a');
    a.href = '#';
    element.appendChild(a);
    element.selected = true;
    element._internals.states.add('anchor'); // typically added via type-anchor controller in base button
    element.requestUpdate();
    await elementIsStable(element);

    expect(a.getAttribute('aria-current')).toBe('page');
  });

  it('should not set aria-selected on host internals when anchor state is active', async () => {
    const a = document.createElement('a');
    a.href = '#';
    element.appendChild(a);
    element.selected = true;
    element._internals.states.add('anchor');
    element.requestUpdate();
    await elementIsStable(element);

    expect(element._internals.ariaSelected).toBe(null);
    expect(element.matches(':state(selected)')).toBe(true);
    expect(a.getAttribute('aria-current')).toBe('page');
  });

  it('should prioritize readonly over anchor state', async () => {
    const a = document.createElement('a');
    a.href = '#';
    element.appendChild(a);
    element.selected = true;
    element.readonly = true;
    element._internals.states.add('anchor');
    element.requestUpdate();
    await elementIsStable(element);

    expect(element._internals.ariaSelected).toBe(null);
    expect(element.matches(':state(selected)')).toBe(false);
    expect(a.getAttribute('aria-current')).toBe(null);
  });

  it('should restore selected state when readonly is removed', async () => {
    element.selected = true;
    element.readonly = true;
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe(null);
    expect(element.matches(':state(selected)')).toBe(false);

    element.readonly = false;
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe('true');
    expect(element.matches(':state(selected)')).toBe(true);
  });
});
