import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
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

  it('should have updated state before select event is dispatched when behaviorSelect is active', async () => {
    element.behaviorSelect = true;
    element.selected = false;
    await elementIsStable(element);

    let stateAtEventTime: boolean | undefined;
    element.addEventListener('select', () => {
      stateAtEventTime = element.selected;
    });

    element.select();
    await elementIsStable(element);

    expect(stateAtEventTime).toBe(true);
  });

  it('should have updated state before select event is dispatched when toggling with behaviorSelect', async () => {
    element.behaviorSelect = true;
    element.selected = false;
    await elementIsStable(element);

    let stateAtEventTime: boolean | undefined;
    element.addEventListener('select', () => {
      stateAtEventTime = element.selected;
    });

    element.toggle();
    await elementIsStable(element);

    expect(stateAtEventTime).toBe(true);
  });

  it('should emit select event with element detail when toggle is called', async () => {
    const event = untilEvent<CustomEvent>(element, 'select');
    element.toggle();
    const result = await event;
    expect(result.detail).toBe(element);
  });

  describe('invoker command support', () => {
    it('should toggle state when receiving --toggle-select command', async () => {
      element.selected = false;
      await elementIsStable(element);

      element.dispatchEvent(new CommandEvent('command', { command: '--toggle-select' }));
      await elementIsStable(element);
      expect(element.selected).toBe(true);

      element.dispatchEvent(new CommandEvent('command', { command: '--toggle-select' }));
      await elementIsStable(element);
      expect(element.selected).toBe(false);
    });

    it('should select when receiving --select command', async () => {
      element.selected = false;
      await elementIsStable(element);

      const event = untilEvent(element, 'select');
      element.dispatchEvent(new CommandEvent('command', { command: '--select' }));
      expect(await event).toBeDefined();
      expect(element.selected).toBe(true);
    });

    it('should deselect when receiving --deselect command', async () => {
      element.selected = true;
      await elementIsStable(element);

      element.dispatchEvent(new CommandEvent('command', { command: '--deselect' }));
      await elementIsStable(element);
      expect(element.selected).toBe(false);
    });

    it('should emit select event when receiving --toggle-select command', async () => {
      element.selected = false;
      await elementIsStable(element);

      const event = untilEvent<CustomEvent>(element, 'select');
      element.dispatchEvent(new CommandEvent('command', { command: '--toggle-select' }));
      const result = await event;
      expect(result.detail).toBe(element);
    });

    it('should have updated state before select event when receiving command', async () => {
      element.selected = false;
      await elementIsStable(element);

      let stateAtEventTime: boolean | undefined;
      element.addEventListener('select', () => {
        stateAtEventTime = element.selected;
      });

      element.dispatchEvent(new CommandEvent('command', { command: '--select' }));
      await elementIsStable(element);

      expect(stateAtEventTime).toBe(true);
    });
  });
});
