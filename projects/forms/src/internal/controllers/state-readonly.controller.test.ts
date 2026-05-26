// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import { StateReadOnlyController } from './state-readonly.controller.js';
import type { ReactiveController } from './types.js';

class StateReadOnlyControllerTestElement extends HTMLElement {
  static formAssociated = true;

  readOnly = false;
  _internals?: ElementInternals;
  #controllers = new Set<ReactiveController>();

  constructor() {
    super();
    new StateReadOnlyController(this);
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

if (!customElements.get('state-readonly-controller-test-element')) {
  customElements.define('state-readonly-controller-test-element', StateReadOnlyControllerTestElement);
}

describe('StateReadOnlyController', () => {
  let element: StateReadOnlyControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-readonly-controller-test-element></state-readonly-controller-test-element>`
    );
    element = fixture.querySelector<StateReadOnlyControllerTestElement>('state-readonly-controller-test-element')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should clear optional aria mirrors and states while readonly', () => {
    element._internals!.ariaDisabled = 'true';
    element._internals!.ariaExpanded = 'true';
    element._internals!.ariaPressed = 'true';
    element._internals!.ariaSelected = 'true';
    element._internals!.ariaCurrent = 'page';
    element._internals!.states.add('expanded');
    element._internals!.states.add('pressed');
    element._internals!.states.add('selected');
    element._internals!.states.add('current');

    element.readOnly = true;
    element.sync();

    expect(element._internals!.ariaDisabled).toBe(null);
    expect(element._internals!.ariaExpanded).toBe(null);
    expect(element._internals!.ariaPressed).toBe(null);
    expect(element._internals!.ariaSelected).toBe(null);
    expect(element._internals!.ariaCurrent).toBe(null);
    expect(element.matches(':state(expanded)')).toBe(false);
    expect(element.matches(':state(pressed)')).toBe(false);
    expect(element.matches(':state(selected)')).toBe(false);
    expect(element.matches(':state(current)')).toBe(false);
  });

  it('should not mutate optional aria mirrors when readonly is false', () => {
    element._internals!.ariaPressed = 'true';
    element._internals!.states.add('pressed');

    element.sync();

    expect(element._internals!.ariaPressed).toBe('true');
    expect(element.matches(':state(pressed)')).toBe(true);
  });
});
