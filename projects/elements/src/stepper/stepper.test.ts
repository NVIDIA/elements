import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { StepperItem, Stepper } from '@elements/elements/stepper';
import '@elements/elements/stepper/define.js';

describe('nve-tab', () => {
  let fixture: HTMLElement;
  let parentElement: Stepper;
  let childElement: StepperItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-stepper>
      <nve-stepper-item></nve-stepper-item>
    </nve-stepper>
    `);
    parentElement = fixture.querySelector('nve-stepper');
    childElement = fixture.querySelector('nve-stepper-item');

    await elementIsStable(parentElement);
    await elementIsStable(childElement);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define parentElement', () => {
    expect(customElements.get('nve-stepper')).toBeDefined();
  });

  it('should define childElement', () => {
    expect(customElements.get('nve-stepper-item')).toBeDefined();
  });

  it('should have correct a18y roles', async () => {
    expect(parentElement._internals.role).toBe('tablist');
    expect(childElement._internals.role).toBe('tab');
  });

  it('should have proper defaults on parent', () => {
    expect(parentElement.vertical).toBe(false);
    expect(parentElement.behaviorSelect).toBe(false);
  });

  it('should handle behaviorSelect via clicking', async () => {
    expect(childElement.selected).toBe(false);
    parentElement.behaviorSelect = true;

    const event = untilEvent(childElement, 'click');
    emulateClick(childElement);
    expect(await event).toBeDefined();

    expect(childElement.selected).toBe(true);
  });

  it('should NOT handle behaviorSelect via clicking by default', async () => {
    expect(childElement.selected).toBe(false);

    const event = untilEvent(childElement, 'click');
    emulateClick(childElement);
    expect(await event).toBeDefined();

    expect(childElement.selected).toBe(false);
  });

  it('should set the correct aria-orientation based on the tab orientation', async () => {
    expect(parentElement.vertical).toBe(false);
    expect(parentElement._internals.ariaOrientation).toBe('horizontal');

    parentElement.vertical = true;
    await elementIsStable(parentElement);

    expect(parentElement.vertical).toBe(true);
    expect(parentElement._internals.ariaOrientation).toBe('vertical');
  });

  it('should set the correct keynav orientation', async () => {
    expect(parentElement.vertical).toBe(false);
    expect(parentElement.keynavListConfig.layout).toBe('horizontal');

    parentElement.vertical = true;
    await elementIsStable(parentElement);

    expect(parentElement.vertical).toBe(true);
    expect(parentElement.keynavListConfig.layout).toBe('vertical');
  });
});
