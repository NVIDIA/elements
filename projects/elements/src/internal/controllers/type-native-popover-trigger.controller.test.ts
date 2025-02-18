import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent, emulateClick } from '@nvidia-elements/testing';
import { TypeNativePopoverTriggerController } from '@nvidia-elements/core/internal';

@customElement('type-native-popover-trigger-controller-test-element')
class TypeNativePopoverTriggerControllerTestElement extends LitElement {
  @property({ type: String }) popoverTargetAction: 'show' | 'hide' | 'toggle';
  @property({ type: Object }) popoverTargetElement: HTMLElement;
  @property({ type: String }) popovertarget: string;
  disabled = false;
  _typeNativePopoverTriggerController = new TypeNativePopoverTriggerController(this);
}

describe('type-native-popover-trigger.controller', () => {
  let element: TypeNativePopoverTriggerControllerTestElement;
  let popover: HTMLElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`
        <type-native-popover-trigger-controller-test-element popovertarget="popover"></type-native-popover-trigger-controller-test-element>
        <div popover id="popover">popover</div>
      `
    );
    element = fixture.querySelector<TypeNativePopoverTriggerControllerTestElement>(
      'type-native-popover-trigger-controller-test-element'
    );
    popover = fixture.querySelector<HTMLElement>('[popover]');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should trigger popover when clicked', async () => {
    expect(popover.matches(':popover-open')).toBe(false);

    const event = untilEvent(element, 'click');
    emulateClick(element);
    expect(await event).toBeDefined();

    await elementIsStable(element);
    expect(popover.matches(':popover-open')).toBe(true);
  });

  it('should trigger open when action is set to show', async () => {
    element.popoverTargetAction = 'show';
    expect(popover.matches(':popover-open')).toBe(false);

    const event = untilEvent(element, 'click');
    emulateClick(element);
    expect(await event).toBeDefined();

    await elementIsStable(element);
    expect(popover.matches(':popover-open')).toBe(true);
  });

  it('should trigger close when action is set to hide', async () => {
    element.popoverTargetAction = 'hide';
    popover.showPopover();
    expect(popover.matches(':popover-open')).toBe(true);

    const event = untilEvent(element, 'click');
    emulateClick(element);
    expect(await event).toBeDefined();

    await elementIsStable(element);
    expect(popover.matches(':popover-open')).toBe(false);
  });

  it('should trigger popover if reference is used', async () => {
    element.popoverTargetElement = popover;
    expect(popover.matches(':popover-open')).toBe(false);

    const event = untilEvent(element, 'click');
    emulateClick(element);
    expect(await event).toBeDefined();

    await elementIsStable(element);
    expect(popover.matches(':popover-open')).toBe(true);
  });
});
