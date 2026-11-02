// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import { TypeButtonController } from './type-button.controller.js';
import type { ReactiveController } from './types.js';

class ButtonBehaviorControllerTestElement extends HTMLElement {
  static formAssociated = true;

  disabled = false;
  readOnly = false;
  _internals = this.attachInternals();
  #controllers = new Set<ReactiveController>();

  constructor() {
    super();
    new TypeButtonController(this);
  }

  addController(controller: ReactiveController) {
    this.#controllers.add(controller);
  }

  connectedCallback() {
    this.#controllers.forEach(controller => controller.hostConnected?.());
  }

  disconnectedCallback() {
    this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }

  sync() {
    this.#controllers.forEach(controller => controller.hostUpdated?.());
  }
}

if (!customElements.get('button-behavior-controller-test-element')) {
  customElements.define('button-behavior-controller-test-element', ButtonBehaviorControllerTestElement);
}

describe('TypeButtonController', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = undefined;
    }
  });

  it('should initialize button role and focus behavior', async () => {
    fixture = await createFixture(
      html`<button-behavior-controller-test-element></button-behavior-controller-test-element>`
    );
    const element = fixture.querySelector<ButtonBehaviorControllerTestElement>(
      'button-behavior-controller-test-element'
    )!;

    element.sync();

    expect(element._internals.role).toBe('button');
    expect(element.tabIndex).toBe(0);

    element.disabled = true;
    element.sync();

    expect(element._internals.role).toBe('button');
    expect(element.tabIndex).toBe(-1);
  });

  it('should remove semantics while readonly and restore default role when enabled', async () => {
    fixture = await createFixture(
      html`<button-behavior-controller-test-element></button-behavior-controller-test-element>`
    );
    const element = fixture.querySelector<ButtonBehaviorControllerTestElement>(
      'button-behavior-controller-test-element'
    )!;

    element.sync();
    element.readOnly = true;
    element.sync();

    expect(element._internals.role).toBe('none');
    expect(element.hasAttribute('tabindex')).toBe(false);
    expect(element.tabIndex).toBe(-1);

    element.readOnly = false;
    element.sync();

    expect(element._internals.role).toBe('button');
    expect(element.tabIndex).toBe(0);
  });

  it('should preserve explicit role and authored tabindex across readonly changes', async () => {
    fixture = await createFixture(html`<div></div>`);
    const element = document.createElement(
      'button-behavior-controller-test-element'
    ) as ButtonBehaviorControllerTestElement;
    element.setAttribute('tabindex', '3');
    fixture.append(element);

    element._internals.role = 'tab';
    element.sync();

    expect(element._internals.role).toBe('tab');
    expect(element.tabIndex).toBe(3);

    element.readOnly = true;
    element.sync();

    expect(element._internals.role).toBe('none');
    expect(element.hasAttribute('tabindex')).toBe(false);

    element.readOnly = false;
    element.sync();

    expect(element._internals.role).toBe('tab');
    expect(element.tabIndex).toBe(3);
  });

  it('should preserve externally managed tabindex during ordinary updates', async () => {
    fixture = await createFixture(
      html`<button-behavior-controller-test-element></button-behavior-controller-test-element>`
    );
    const element = fixture.querySelector<ButtonBehaviorControllerTestElement>(
      'button-behavior-controller-test-element'
    )!;
    element.sync();
    element.tabIndex = -1;
    element.sync();
    expect(element.tabIndex).toBe(-1);
    element.tabIndex = 0;
    element.sync();
    expect(element.tabIndex).toBe(0);
  });

  it('should restore the enabled tabindex after disabling', async () => {
    fixture = await createFixture(
      html`<button-behavior-controller-test-element></button-behavior-controller-test-element>`
    );
    const element = fixture.querySelector<ButtonBehaviorControllerTestElement>(
      'button-behavior-controller-test-element'
    )!;
    element.sync();
    expect(element.tabIndex).toBe(0);
    element.disabled = true;
    element.sync();
    expect(element.tabIndex).toBe(-1);
    element.disabled = false;
    element.sync();
    expect(element.tabIndex).toBe(0);
  });

  it.each(['disabled', 'readOnly'] as const)('should restore managed tabindex after %s changes', async state => {
    fixture = await createFixture(html`<div></div>`);
    const element = document.createElement(
      'button-behavior-controller-test-element'
    ) as ButtonBehaviorControllerTestElement;
    element.tabIndex = 3;
    fixture.append(element);
    element.sync();
    element.tabIndex = -1;
    element.sync();
    expect(element.tabIndex).toBe(-1);
    element[state] = true;
    element.sync();
    element.sync();
    expect(element.tabIndex).toBe(-1);
    expect(element.hasAttribute('tabindex')).toBe(state === 'disabled');
    element[state] = false;
    element.sync();
    expect(element.tabIndex).toBe(-1);
    element.tabIndex = 2;
    element[state] = true;
    element.sync();
    element[state] = false;
    element.sync();
    expect(element.tabIndex).toBe(2);
  });

  it.each(['disabled', 'readOnly'] as const)(
    'should preserve initial tabindex when initially %s and reconnected',
    async state => {
      fixture = await createFixture(html`<div></div>`);
      const element = document.createElement(
        'button-behavior-controller-test-element'
      ) as ButtonBehaviorControllerTestElement;
      element.tabIndex = 3;
      element[state] = true;
      fixture.append(element);
      element.sync();
      element.remove();
      fixture.append(element);
      element.sync();
      expect(element.tabIndex).toBe(-1);
      element[state] = false;
      element.sync();
      expect(element.tabIndex).toBe(3);
    }
  );

  it('should restore tabindex only after both disabled and readonly clear', async () => {
    fixture = await createFixture(
      html`<button-behavior-controller-test-element></button-behavior-controller-test-element>`
    );
    const element = fixture.querySelector<ButtonBehaviorControllerTestElement>(
      'button-behavior-controller-test-element'
    )!;
    element.sync();
    element.tabIndex = 2;
    element.disabled = true;
    element.sync();
    element.readOnly = true;
    element.sync();
    element.disabled = false;
    element.sync();
    expect(element.hasAttribute('tabindex')).toBe(false);
    element.readOnly = false;
    element.sync();
    expect(element.tabIndex).toBe(2);
  });
});
