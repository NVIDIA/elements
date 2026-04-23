// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { TypeClosableController } from '@nvidia-elements/core/internal';

@customElement('type-closable-controller-test-element')
class TypeClosableControllerTestElement extends LitElement {
  @property({ type: Boolean }) closable: boolean;
  #typeClosableController = new TypeClosableController(this);

  close() {
    this.#typeClosableController.close();
  }
}

describe('type-closable.controller', () => {
  let element: TypeClosableControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<type-closable-controller-test-element></type-closable-controller-test-element>`
    );
    element = fixture.querySelector<TypeClosableControllerTestElement>('type-closable-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should attach element internals when host connects', async () => {
    await elementIsStable(element);
    const host = element as unknown as { _internals?: ElementInternals };
    expect(host._internals).toBeDefined();
  });

  it('should set hidden and emit close when command event is dispatched', async () => {
    await elementIsStable(element);
    const closePromise = untilEvent(element, 'close');
    element.dispatchEvent(new CustomEvent('command', { bubbles: true }));

    const closeEvent = await closePromise;
    expect(closeEvent).toBeDefined();
    expect(closeEvent.bubbles).toBe(true);
    expect(element.hidden).toBe(true);
  });

  it('should emit close when close() is called and closable is true', async () => {
    element.closable = true;
    await elementIsStable(element);

    const eventPromise = untilEvent(element, 'close');
    element.close();
    const closeEvent = await eventPromise;
    expect(closeEvent).toBeDefined();
    expect(closeEvent.bubbles).toBe(true);
  });

  it('should not emit close when close() is called and closable is false', async () => {
    element.closable = false;
    await elementIsStable(element);

    let closed = false;
    element.addEventListener('close', () => (closed = true));
    element.close();
    expect(closed).toBe(false);
  });
});
