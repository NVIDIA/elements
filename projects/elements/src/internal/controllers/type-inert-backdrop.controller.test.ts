import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { TypeInertBackdropController } from '@nvidia-elements/core/internal';

@customElement('type-inert-backdrop-controller-test-element')
class TypeInertBackdropControllerTestElement extends LitElement {
  #typeInertBackdropController = new TypeInertBackdropController(this);

  toggle() {
    this.#typeInertBackdropController.toggle();
  }

  enable() {
    this.#typeInertBackdropController.enable();
  }

  disable() {
    this.#typeInertBackdropController.disable();
  }
}

describe('type-inert-backdrop.controller', () => {
  let element: TypeInertBackdropControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<type-inert-backdrop-controller-test-element></type-inert-backdrop-controller-test-element>`
    );
    element = fixture.querySelector<TypeInertBackdropControllerTestElement>(
      'type-inert-backdrop-controller-test-element'
    );
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should enable inert backdrop', async () => {
    element.enable();
    expect(document.body.style.pointerEvents).toBe('none');
  });

  it('should disable inert backdrop', async () => {
    element.enable();
    expect(document.body.style.pointerEvents).toBe('none');

    element.disable();
    expect(document.body.style.pointerEvents).toBe('initial');
  });

  it('should toggle inert backdrop', async () => {
    element.toggle();
    expect(document.body.style.pointerEvents).toBe('none');

    element.toggle();
    expect(document.body.style.pointerEvents).toBe('initial');
  });

  it('should disable if element is hidden', async () => {
    element.toggle();
    expect(document.body.style.pointerEvents).toBe('none');

    element.setAttribute('hidden', '');
    await elementIsStable(element);
    expect(document.body.style.pointerEvents).toBe('initial');
  });

  it('should disable if element is removed from DOM', async () => {
    element.toggle();
    expect(document.body.style.pointerEvents).toBe('none');

    element.remove();
    await elementIsStable(element);
    expect(document.body.style.pointerEvents).toBe('initial');
  });
});
