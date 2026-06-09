// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import { StateCurrentController } from './state-current.controller.js';
import type { ReactiveController } from './types.js';

class StateCurrentControllerTestElement extends HTMLElement {
  static formAssociated = true;

  current?: string | null;
  readOnly = false;
  selected?: boolean | null;
  _internals?: ElementInternals;
  #controllers = new Set<ReactiveController>();

  constructor() {
    super();
    new StateCurrentController(this);
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

if (!customElements.get('state-current-controller-test-element')) {
  customElements.define('state-current-controller-test-element', StateCurrentControllerTestElement);
}

describe('StateCurrentController', () => {
  let element: StateCurrentControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-current-controller-test-element></state-current-controller-test-element>`
    );
    element = fixture.querySelector<StateCurrentControllerTestElement>('state-current-controller-test-element')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync current aria and custom state', () => {
    element.current = 'page';
    element.sync();

    expect(element._internals!.ariaCurrent).toBe('page');
    expect(element.matches(':state(current)')).toBe(true);

    element.current = null;
    element.sync();

    expect(element._internals!.ariaCurrent).toBe(null);
    expect(element.matches(':state(current)')).toBe(false);
  });

  it('should move current state to anchor aria-current for anchor hosts', () => {
    const anchor = document.createElement('a');
    element.append(anchor);
    element._internals!.states.add('anchor');

    element.current = 'page';
    element.sync();

    expect(element._internals!.ariaCurrent).toBe(null);
    expect(element.matches(':state(current)')).toBe(true);
    expect(anchor.getAttribute('aria-current')).toBe('page');

    element.current = null;
    element.sync();

    expect(anchor.hasAttribute('aria-current')).toBe(false);
    expect(element.matches(':state(current)')).toBe(false);
  });

  it('should preserve current value on anchor aria-current', () => {
    const anchor = document.createElement('a');
    element.append(anchor);
    element._internals!.states.add('anchor');

    element.current = 'step';
    element.sync();

    expect(anchor.getAttribute('aria-current')).toBe('step');
  });

  it('should remove anchor aria-current while readonly', () => {
    const anchor = document.createElement('a');
    element.append(anchor);
    element._internals!.states.add('anchor');
    element.current = 'page';
    element.sync();

    element.readOnly = true;
    element.sync();

    expect(anchor.hasAttribute('aria-current')).toBe(false);
  });
});
