import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { TypeSelectableController } from '@nvidia-elements/core/internal';

@customElement('type-selectable-controller-test-element')
class TypeSelectableControllerTestElement extends LitElement {
  @property({ type: Boolean }) selected: boolean;

  @property({ type: String }) selectable: 'single' | 'multi';

  @property({ type: Boolean }) behaviorSelect: boolean;

  #typeSelectableController = new TypeSelectableController(this);

  select() {
    this.#typeSelectableController.select();
  }

  toggle() {
    this.#typeSelectableController.toggle();
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

  it('should update selectable style state', async () => {
    expect(element.matches(':state(selectable-single)')).toBeFalsy();

    element.selectable = 'single';
    await elementIsStable(element);
    expect(element.matches(':state(selectable-single)')).toBeTruthy();

    element.selectable = 'multi';
    await elementIsStable(element);
    expect(element.matches(':state(selectable-multi)')).toBeTruthy();
  });

  it('should toggle selectable state if behavior-select active', async () => {
    element.behaviorSelect = true;
    expect(element.selected).toBe(undefined);

    element.toggle();
    await elementIsStable(element);
    expect(element.selected).toBe(true);

    element.toggle();
    await elementIsStable(element);
    expect(element.selected).toBe(false);
  });

  it('should not toggle selectable state if behavior-select not active', async () => {
    expect(element.selected).toBe(undefined);

    element.toggle();
    await elementIsStable(element);
    expect(element.selected).toBe(undefined);
  });
});
