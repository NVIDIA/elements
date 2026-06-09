// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import { StateSelectedController } from './state-selected.controller.js';
import type { ReactiveController } from './types.js';

class StateSelectedControllerTestElement extends HTMLElement {
  static formAssociated = true;

  current?: string | null;
  readOnly = false;
  selected?: boolean | null;
  _internals?: ElementInternals;
  #controllers = new Set<ReactiveController>();

  constructor() {
    super();
    new StateSelectedController(this);
  }

  addController(controller: ReactiveController) {
    this.#controllers.add(controller);
  }

  connectedCallback() {
    this.#controllers.forEach(controller => controller.hostConnected?.());
  }

  sync() {
    this.#controllers.forEach(controller => controller.hostUpdated?.());
  }
}

if (!customElements.get('state-selected-controller-test-element')) {
  customElements.define('state-selected-controller-test-element', StateSelectedControllerTestElement);
}

describe('StateSelectedController', () => {
  let element: StateSelectedControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-selected-controller-test-element></state-selected-controller-test-element>`
    );
    element = fixture.querySelector<StateSelectedControllerTestElement>('state-selected-controller-test-element')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync selected aria and custom state', () => {
    element.selected = true;
    element.sync();

    expect(element._internals!.ariaSelected).toBe('true');
    expect(element.matches(':state(selected)')).toBe(true);

    element.selected = false;
    element.sync();

    expect(element._internals!.ariaSelected).toBe('false');
    expect(element.matches(':state(selected)')).toBe(false);

    element.selected = null;
    element.sync();

    expect(element._internals!.ariaSelected).toBe(null);
  });

  it('should move selected state to anchor aria-current for anchor hosts', () => {
    const anchor = document.createElement('a');
    element.append(anchor);
    element._internals!.states.add('anchor');

    element.selected = true;
    element.sync();

    expect(element._internals!.ariaSelected).toBe(null);
    expect(element.matches(':state(selected)')).toBe(true);
    expect(anchor.getAttribute('aria-current')).toBe('page');

    element.selected = false;
    element.sync();

    expect(anchor.hasAttribute('aria-current')).toBe(false);
    expect(element.matches(':state(selected)')).toBe(false);
  });

  it('should preserve current value on selected anchor aria-current', () => {
    const anchor = document.createElement('a');
    element.append(anchor);
    element._internals!.states.add('anchor');

    element.current = 'step';
    element.selected = true;
    element.sync();

    expect(anchor.getAttribute('aria-current')).toBe('step');
  });

  it('should remove anchor aria-current while readonly', () => {
    const anchor = document.createElement('a');
    element.append(anchor);
    element._internals!.states.add('anchor');
    element.selected = true;
    element.sync();

    element.readOnly = true;
    element.sync();

    expect(anchor.hasAttribute('aria-current')).toBe(false);
  });
});
