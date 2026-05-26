// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import { TypeAnchorController } from './type-anchor.controller.js';
import type { ReactiveController } from './types.js';

class AnchorBehaviorControllerTestElement extends HTMLElement {
  static formAssociated = true;

  disabled = false;
  _internals = this.attachInternals();
  #controllers = new Set<ReactiveController>();
  #readOnly = false;

  _anchorBehaviorController = new TypeAnchorController(this);

  get readOnly() {
    return this.#readOnly || this._anchorBehaviorController.readOnly;
  }

  set readOnly(value: boolean) {
    this.#readOnly = value;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = '<slot></slot>';
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

class AnchorBehaviorControllerSlotTestElement extends AnchorBehaviorControllerTestElement {
  constructor() {
    super();
    this.shadowRoot!.innerHTML = '<slot></slot><slot name="anchor"></slot>';
  }
}

if (!customElements.get('anchor-behavior-controller-test-element')) {
  customElements.define('anchor-behavior-controller-test-element', AnchorBehaviorControllerTestElement);
}

if (!customElements.get('anchor-behavior-controller-slot-test-element')) {
  customElements.define('anchor-behavior-controller-slot-test-element', AnchorBehaviorControllerSlotTestElement);
}

describe('AnchorBehaviorController', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  describe('slotted anchors', () => {
    let anchor: HTMLAnchorElement;
    let element: AnchorBehaviorControllerTestElement;

    beforeEach(async () => {
      fixture = await createFixture(
        html`<anchor-behavior-controller-test-element>
          <a href="#target">target</a>
        </anchor-behavior-controller-test-element>`
      );
      element = fixture.querySelector<AnchorBehaviorControllerTestElement>('anchor-behavior-controller-test-element')!;
      anchor = fixture.querySelector<HTMLAnchorElement>('a')!;
    });

    it('should assign slotted anchors and set anchor state', () => {
      element.sync();

      expect(element.readOnly).toBe(true);
      expect(element.matches(':state(anchor)')).toBe(true);
    });

    it('should reset owned readonly state when the anchor is removed', () => {
      element.sync();
      anchor.remove();
      element.sync();

      expect(element.readOnly).toBe(false);
      expect(element.matches(':state(anchor)')).toBe(false);
    });

    it('should prevent disabled anchor clicks', () => {
      element.sync();
      element.disabled = true;
      const listener = vi.fn();
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });

      anchor.addEventListener('click', listener);
      anchor.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  it('should move slotted anchors into the anchor slot and remove empty text nodes', async () => {
    fixture = await createFixture(
      html`<anchor-behavior-controller-slot-test-element>
        <a href="#target">target</a>
      </anchor-behavior-controller-slot-test-element>`
    );
    const element = fixture.querySelector<AnchorBehaviorControllerSlotTestElement>(
      'anchor-behavior-controller-slot-test-element'
    )!;
    const anchor = fixture.querySelector<HTMLAnchorElement>('a')!;

    element.sync();

    expect(anchor.slot).toBe('anchor');
    expect(
      [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === '')
    ).toHaveLength(0);
  });

  it('should preserve authored readonly state when the anchor is removed', async () => {
    fixture = await createFixture(
      html`<anchor-behavior-controller-test-element>
        <a href="#target">target</a>
      </anchor-behavior-controller-test-element>`
    );
    const element = fixture.querySelector<AnchorBehaviorControllerTestElement>(
      'anchor-behavior-controller-test-element'
    )!;
    const anchor = fixture.querySelector<HTMLAnchorElement>('a')!;

    element.readOnly = true;
    element.sync();
    anchor.remove();
    element.sync();

    expect(element.readOnly).toBe(true);
    expect(element.matches(':state(anchor)')).toBe(false);
  });

  it('should style parent anchors as the click affordance', async () => {
    fixture = await createFixture(
      html`<a href="#target"><anchor-behavior-controller-test-element></anchor-behavior-controller-test-element></a>`
    );
    const element = fixture.querySelector<AnchorBehaviorControllerTestElement>(
      'anchor-behavior-controller-test-element'
    )!;
    const anchor = fixture.querySelector<HTMLAnchorElement>('a')!;

    element.sync();

    expect(anchor.style.textDecoration).toBe('none');
    expect(element.style.cursor).toBe('pointer');
    expect(element.matches(':state(anchor)')).toBe(true);
  });
});
