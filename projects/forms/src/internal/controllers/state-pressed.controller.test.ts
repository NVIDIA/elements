// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import { StatePressedController } from './state-pressed.controller.js';
import type { ReactiveController } from './types.js';

class StatePressedControllerTestElement extends HTMLElement {
  static formAssociated = true;

  pressed?: boolean | null;
  _internals?: ElementInternals;
  #controllers = new Set<ReactiveController>();

  constructor() {
    super();
    new StatePressedController(this);
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

if (!customElements.get('state-pressed-controller-test-element')) {
  customElements.define('state-pressed-controller-test-element', StatePressedControllerTestElement);
}

describe('StatePressedController', () => {
  let element: StatePressedControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-pressed-controller-test-element></state-pressed-controller-test-element>`
    );
    element = fixture.querySelector<StatePressedControllerTestElement>('state-pressed-controller-test-element')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync pressed aria and custom state', () => {
    element.pressed = true;
    element.sync();

    expect(element._internals!.ariaPressed).toBe('true');
    expect(element.matches(':state(pressed)')).toBe(true);

    element.pressed = false;
    element.sync();

    expect(element._internals!.ariaPressed).toBe('false');
    expect(element.matches(':state(pressed)')).toBe(false);
  });

  it('should leave aria-pressed unset for absent values', () => {
    element.pressed = undefined;
    element.sync();

    expect(element._internals!.ariaPressed).toBe(null);
    expect(element.matches(':state(pressed)')).toBe(false);
  });
});
