import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent, emulateClick } from '@elements/elements/test';
import { TypeClosableController } from '@elements/elements/internal';

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
    fixture = await createFixture(html`<type-closable-controller-test-element></type-closable-controller-test-element>`);
    element = fixture.querySelector<TypeClosableControllerTestElement>('type-closable-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should emit close event when close button clicked', async () => {
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.close();
    expect((await event)).toBeDefined();
  });
});
