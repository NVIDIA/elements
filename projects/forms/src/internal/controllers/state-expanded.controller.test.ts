// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import { StateExpandedController } from './state-expanded.controller.js';
import type { ReactiveController } from './types.js';

class StateExpandedControllerTestElement extends HTMLElement {
  static formAssociated = true;

  expanded?: boolean | null;
  _internals?: ElementInternals;
  #controllers = new Set<ReactiveController>();

  constructor() {
    super();
    new StateExpandedController(this);
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

if (!customElements.get('state-expanded-controller-test-element')) {
  customElements.define('state-expanded-controller-test-element', StateExpandedControllerTestElement);
}

describe('StateExpandedController', () => {
  let element: StateExpandedControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-expanded-controller-test-element></state-expanded-controller-test-element>`
    );
    element = fixture.querySelector<StateExpandedControllerTestElement>('state-expanded-controller-test-element')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync expanded aria and custom state', () => {
    element.expanded = true;
    element.sync();

    expect(element._internals!.ariaExpanded).toBe('true');
    expect(element.matches(':state(expanded)')).toBe(true);

    element.expanded = false;
    element.sync();

    expect(element._internals!.ariaExpanded).toBe('false');
    expect(element.matches(':state(expanded)')).toBe(false);
  });

  it('should leave aria-expanded unset for absent values', () => {
    element.expanded = true;
    element.sync();

    element.expanded = null;
    element.sync();

    expect(element._internals!.ariaExpanded).toBe(null);
    expect(element.matches(':state(expanded)')).toBe(false);
  });
});
