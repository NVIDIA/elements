// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { userEvent } from 'vitest/browser';
import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import { StateActiveController } from './state-active.controller.js';
import type { ReactiveController } from './types.js';

class StateActiveControllerTestElement extends HTMLElement {
  static formAssociated = true;

  disabled = false;
  _internals?: ElementInternals;
  #controllers = new Set<ReactiveController>();

  constructor() {
    super();
    new StateActiveController(this);
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
}

if (!customElements.get('state-active-controller-test-element')) {
  customElements.define('state-active-controller-test-element', StateActiveControllerTestElement);
}

describe('StateActiveController', () => {
  let element: StateActiveControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<state-active-controller-test-element></state-active-controller-test-element>`);
    element = fixture.querySelector<StateActiveControllerTestElement>('state-active-controller-test-element')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should add and clear active state from pointer and keyboard events', () => {
    element.dispatchEvent(new MouseEvent('mousedown'));
    expect(element.matches(':state(active)')).toBe(true);

    element.dispatchEvent(new MouseEvent('mouseup'));
    expect(element.matches(':state(active)')).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    expect(element.matches(':state(active)')).toBe(true);

    element.dispatchEvent(new KeyboardEvent('keyup'));
    expect(element.matches(':state(active)')).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
    expect(element.matches(':state(active)')).toBe(true);

    element.dispatchEvent(new FocusEvent('blur'));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should ignore disabled hosts and non-activation keys', () => {
    element.disabled = true;
    element.dispatchEvent(new MouseEvent('mousedown'));
    expect(element.matches(':state(active)')).toBe(false);

    element.disabled = false;
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should prevent default space keydown scrolling on the host', () => {
    const space = new KeyboardEvent('keydown', { code: 'Space', cancelable: true });
    const enter = new KeyboardEvent('keydown', { code: 'Enter', cancelable: true });

    element.dispatchEvent(space);
    element.dispatchEvent(enter);

    expect(space.defaultPrevented).toBe(true);
    expect(enter.defaultPrevented).toBe(false);
  });

  it('should hold the active state for a real space or enter key', async () => {
    element.tabIndex = 0;
    element.focus();

    await userEvent.keyboard('{Space>}');
    expect(element.matches(':state(active)')).toBe(true);
    await userEvent.keyboard('{/Space}');
    expect(element.matches(':state(active)')).toBe(false);

    await userEvent.keyboard('{Enter>}');
    expect(element.matches(':state(active)')).toBe(true);
    await userEvent.keyboard('{/Enter}');
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should remove active listeners on disconnect', () => {
    element.remove();
    element.dispatchEvent(new MouseEvent('mousedown'));

    expect(element.matches(':state(active)')).toBe(false);
  });
});
