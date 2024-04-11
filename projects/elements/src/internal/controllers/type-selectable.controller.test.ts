import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { TypeSelectableController } from '@nvidia-elements/core/internal';

@customElement('type-selectable-controller-test-element')
class TypeSelectableControllerTestElement extends LitElement {
  @property({ type: Boolean }) selected: boolean;

  @property({ type: Boolean }) behaviorSelect: boolean;

  #typeSelectableController = new TypeSelectableController(this);

  select() {
    this.#typeSelectableController.select();
  }
}

describe('type-selectable.controller', () => {
  let element: TypeSelectableControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<type-selectable-controller-test-element></type-selectable-controller-test-element>`
    );
    element = fixture.querySelector<TypeSelectableControllerTestElement>('type-selectable-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should emit select event element is selected and default to stateless', async () => {
    element.selected = false;
    await elementIsStable(element);

    const event = untilEvent(element, 'select');
    element.select();
    expect(await event).toBeDefined();
    expect(element.selected).toBe(false);
  });

  it('should set state if selected behavior', async () => {
    element.behaviorSelect = true;
    element.selected = false;
    await elementIsStable(element);

    const event = untilEvent(element, 'select');
    element.select();
    expect(await event).toBeDefined();
    expect(element.selected).toBe(true);
  });
});
