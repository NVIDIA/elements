import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { StepsItem, Steps } from '@nvidia-elements/core/steps';
import { ProgressRing } from '@nvidia-elements/core/progress-ring';
import { IconButton } from '@nvidia-elements/core/icon-button';
import '@nvidia-elements/core/steps/define.js';

describe(Steps.metadata.tag, () => {
  let fixture: HTMLElement;
  let parentElement: Steps;
  let childElement: StepsItem;
  let childElements: StepsItem[];

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-steps>
      <nve-steps-item></nve-steps-item>
      <nve-steps-item></nve-steps-item>
    </nve-steps>
    `);
    parentElement = fixture.querySelector(Steps.metadata.tag);
    childElement = fixture.querySelector(StepsItem.metadata.tag);
    childElements = Array.from(fixture.querySelectorAll(StepsItem.metadata.tag));

    await elementIsStable(parentElement);
    await elementIsStable(childElement);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define parentElement', () => {
    expect(customElements.get(Steps.metadata.tag)).toBeDefined();
  });

  it('should define childElement', () => {
    expect(customElements.get(StepsItem.metadata.tag)).toBeDefined();
  });

  it('should have correct a11y roles', async () => {
    expect(parentElement._internals.role).toBe('tablist');
    expect(childElement._internals.role).toBe('tab');
  });

  it('should have a type default of button', async () => {
    await elementIsStable(childElement);
    expect(childElement.type).toBe('button');
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

  it('should set the correct aria-orientation based on the steps orientation', async () => {
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

  it('should display step number', async () => {
    await elementIsStable(childElement);
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).textContent).toBe('1');
  });

  it('should display icon with default status', async () => {
    await elementIsStable(childElement);
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).interaction).toBe(undefined);
  });

  it('should display success icon styles with success status', async () => {
    childElement.status = 'success';
    await elementIsStable(childElement);
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).interaction).toBe('emphasis');
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).iconName).toBe('check');
  });

  it('should display danger icon with danger status', async () => {
    childElement.status = 'danger';
    await elementIsStable(childElement);
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).interaction).toBe('destructive');
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).iconName).toBe(
      'exclamation-circle'
    );
  });

  it('should display progress ring in pending status', async () => {
    childElement.status = 'pending';
    await elementIsStable(childElement);
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag)).toBeFalsy();
    expect(childElement.shadowRoot.querySelector<ProgressRing>(ProgressRing.metadata.tag).status).toBe('accent');
  });

  it('should count number of steps', async () => {
    await elementIsStable(childElement);
    expect(childElements.length).toBe(2);
    expect(childElements[0].index).toBe(1);
    expect(childElements[1].index).toBe(2);
  });
});
