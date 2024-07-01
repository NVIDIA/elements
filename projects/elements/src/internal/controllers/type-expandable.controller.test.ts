import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { TypeExpandableController } from '@nvidia-elements/core/internal';

@customElement('type-expandable-controller-test-element')
class TypeExpandableControllerTestElement extends LitElement {
  @property({ type: Boolean }) expanded: boolean;

  @property({ type: Boolean }) expandable: boolean;

  @property({ type: Boolean }) behaviorExpand: boolean;

  #typeExpandableController = new TypeExpandableController(this);

  close() {
    this.#typeExpandableController.close();
  }

  open() {
    this.#typeExpandableController.open();
  }

  toggle() {
    this.#typeExpandableController.toggle();
  }
}

describe('type-expandable.controller', () => {
  let element: TypeExpandableControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<type-expandable-controller-test-element></type-expandable-controller-test-element>`
    );
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
    expect(await event).toBeDefined();
    expect((await event).bubbles).toBe(true);
    expect(element.expanded).toBe(true); // default to stateless
  });

  it('should emit open event when open button clicked', async () => {
    element.expanded = false;
    await elementIsStable(element);

    const event = untilEvent(element, 'open');
    element.open();
    expect(await event).toBeDefined();
    expect((await event).bubbles).toBe(true);
    expect(element.expanded).toBe(false); // default to stateless
  });

  it('should enable auto stateful expanding if behavior-expand is set', async () => {
    element.expanded = false;
    element.behaviorExpand = true;
    await elementIsStable(element);

    element.toggle();
    expect(element.expanded).toBe(true);

    element.toggle();
    expect(element.expanded).toBe(false);
  });

  it('should update expandable style state', async () => {
    expect(element.matches(':state(expandable)')).toBeFalsy();

    element.expandable = true;
    await elementIsStable(element);
    expect(element.matches(':state(expandable)')).toBeTruthy();

    element.expandable = false;
    await elementIsStable(element);
    expect(element.matches(':state(expandable)')).toBeFalsy();
  });
});
