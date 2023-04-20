import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@elements/elements/test';
import { TypeExpandableController } from '@elements/elements/internal';

@customElement('type-expandable-controller-test-element')
class TypeExpandableControllerTestElement extends LitElement {
  @property({ type: Boolean }) expanded: boolean;
  #typeExpandableController = new TypeExpandableController(this);

  close() {
    this.#typeExpandableController.close();
  }

  open() {
    this.#typeExpandableController.open();
  }
}

describe('type-expandable.controller', () => {
  let element: TypeExpandableControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<type-expandable-controller-test-element></type-expandable-controller-test-element>`);
    element = fixture.querySelector<TypeExpandableControllerTestElement>('type-expandable-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should emit close event when close button clicked', async () => {
    element.expanded = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.close();
    expect((await event)).toBeDefined();
  });

  it('should emit open event when open button clicked', async () => {
    element.expanded = false;
    await elementIsStable(element);

    const event = untilEvent(element, 'open');
    element.open();
    expect((await event)).toBeDefined();
  });
});
