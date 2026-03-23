import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent, emulateClick } from '@internals/testing';
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

    const event = untilEvent(popover, 'toggle');
    emulateClick(element);
    expect(await event).toBeDefined();

    await elementIsStable(element);
    expect(popover.matches(':popover-open')).toBe(true);
  });

  it('should trigger popover in cross render roots', async () => {
    const shadowHost = document.createElement('div');
    shadowHost.attachShadow({ mode: 'open' });
    shadowHost.shadowRoot.appendChild(popover);
    document.body.appendChild(shadowHost);

    const event = untilEvent(popover, 'toggle');
    emulateClick(element);
    expect(await event).toBeDefined();

    await elementIsStable(element);
    expect(popover.matches(':popover-open')).toBe(true);

    // Cleanup: close popover and remove shadowHost to prevent test pollution
    popover.hidePopover();
    shadowHost.remove();
  });

  it('should pass source element in toggle event when action is toggle', async () => {
    expect(popover.matches(':popover-open')).toBe(false);

    const toggleEvent = untilEvent(popover, 'toggle') as Promise<ToggleEvent>;
    emulateClick(element);
    const event = await toggleEvent;

    expect(event.source).toBe(element);
  });

  it('should pass source element in toggle event when action is show', async () => {
    element.popoverTargetAction = 'show';
    expect(popover.matches(':popover-open')).toBe(false);

    const toggleEvent = untilEvent(popover, 'toggle') as Promise<ToggleEvent>;
    emulateClick(element);
    const event = await toggleEvent;

    expect(event.source).toBe(element);
  });

  // // source element is not passed back to follow same standard behavior as native button elements
  it('should not pass source element in toggle event when action is hide', async () => {
    element.popoverTargetAction = 'hide';
    popover.showPopover({ source: element });
    expect(popover.matches(':popover-open')).toBe(true);

    const toggleEvent = untilEvent(popover, 'toggle') as Promise<ToggleEvent>;
    emulateClick(element);
    const event = await toggleEvent;

    expect(event.source).toBeNull();
  });

  it('should not throw when clicking without any popover target configured', async () => {
    fixture = await createFixture(
      html`<type-native-popover-trigger-controller-test-element></type-native-popover-trigger-controller-test-element>`
    );
    element = fixture.querySelector<TypeNativePopoverTriggerControllerTestElement>(
      'type-native-popover-trigger-controller-test-element'
    );
    await elementIsStable(element);

    expect(() => emulateClick(element)).not.toThrow();
  });

  it('should not attempt DOM lookup when popoverTargetElement is already set', async () => {
    element.popoverTargetElement = popover;
    element.popovertarget = 'nonexistent-id';
    await elementIsStable(element);

    expect(popover.matches(':popover-open')).toBe(false);
    emulateClick(element);
    await elementIsStable(element);

    expect(popover.matches(':popover-open')).toBe(true);
  });

  it('should not toggle popover when disabled', async () => {
    element.disabled = true;
    expect(popover.matches(':popover-open')).toBe(false);

    emulateClick(element);
    await elementIsStable(element);

    expect(popover.matches(':popover-open')).toBe(false);
  });
});
