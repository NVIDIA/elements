// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import { StateDisabledController } from './state-disabled.controller.js';
import type { ReactiveController } from './types.js';

class StateDisabledControllerTestElement extends HTMLElement {
  static formAssociated = true;

  disabled = false;
  readOnly = false;
  _internals?: ElementInternals;
  #controllers = new Set<ReactiveController>();

  constructor() {
    super();
    new StateDisabledController(this);
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

if (!customElements.get('state-disabled-controller-test-element')) {
  customElements.define('state-disabled-controller-test-element', StateDisabledControllerTestElement);
}

describe('StateDisabledController', () => {
  let element: StateDisabledControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-disabled-controller-test-element></state-disabled-controller-test-element>`
    );
    element = fixture.querySelector<StateDisabledControllerTestElement>('state-disabled-controller-test-element')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync disabled aria and custom state', () => {
    element.disabled = true;
    element.sync();

    expect(element._internals!.ariaDisabled).toBe('true');
    expect(element.matches(':state(disabled)')).toBe(true);

    element.disabled = false;
    element.sync();

    expect(element._internals!.ariaDisabled).toBe('false');
    expect(element.matches(':state(disabled)')).toBe(false);
  });

  it('should suppress aria-disabled while readonly', () => {
    element.disabled = true;
    element.readOnly = true;
    element.sync();

    expect(element._internals!.ariaDisabled).toBe(null);
    expect(element.matches(':state(disabled)')).toBe(true);
  });
});
