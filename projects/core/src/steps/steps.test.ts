// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
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

  it('should expose aria-selected="false" by default', async () => {
    expect(childElement.selected).toBe(false);
    expect(childElement._internals.ariaSelected).toBe('false');
  });

  it('should expose aria-selected="true" when selected is set directly', async () => {
    childElement.selected = true;
    await elementIsStable(childElement);
    expect(childElement._internals.ariaSelected).toBe('true');
  });

  it('should update aria-selected when selection changes via behaviorSelect click', async () => {
    expect(childElement._internals.ariaSelected).toBe('false');
    parentElement.behaviorSelect = true;

    emulateClick(childElement);
    await elementIsStable(childElement);

    expect(childElement._internals.ariaSelected).toBe('true');
  });

  it('should flip aria-selected on siblings when a new step is selected', async () => {
    childElements[0].selected = true;
    await elementIsStable(childElements[0]);
    expect(childElements[0]._internals.ariaSelected).toBe('true');
    expect(childElements[1]._internals.ariaSelected).toBe('false');

    parentElement.behaviorSelect = true;
    emulateClick(childElements[1]);
    await elementIsStable(childElements[0]);
    await elementIsStable(childElements[1]);

    expect(childElements[0]._internals.ariaSelected).toBe('false');
    expect(childElements[1]._internals.ariaSelected).toBe('true');
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

  it('should pair click listener adds and removes across reconnects with the same reference', async () => {
    const addSpy = vi.spyOn(parentElement, 'addEventListener');
    const removeSpy = vi.spyOn(parentElement, 'removeEventListener');
    addSpy.mockClear();
    removeSpy.mockClear();

    parentElement.remove();
    fixture.appendChild(parentElement);
    await elementIsStable(parentElement);
    parentElement.remove();
    fixture.appendChild(parentElement);
    await elementIsStable(parentElement);

    const clickAdds = addSpy.mock.calls.filter(([type]) => type === 'click');
    const clickRemoves = removeSpy.mock.calls.filter(([type]) => type === 'click');
    expect(clickAdds.length).toBe(clickRemoves.length);
    expect(clickAdds.every(([, handler]) => handler === clickAdds[0]![1])).toBe(true);
    expect(clickRemoves.every(([, handler]) => handler === clickAdds[0]![1])).toBe(true);
  });

  it('should still respond to clicks after disconnect and reconnect', async () => {
    parentElement.behaviorSelect = true;

    parentElement.remove();
    fixture.appendChild(parentElement);
    await elementIsStable(parentElement);

    emulateClick(childElement);
    await elementIsStable(childElement);
    expect(childElement.selected).toBe(true);
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

  it('should be stateless and render prefix content correctly when reverting a status change', async () => {
    await elementIsStable(childElement);
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).textContent).toBe('1');

    childElement.status = 'success';
    await elementIsStable(childElement);
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).interaction).toBe('emphasis');
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).iconName).toBe('check');
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).textContent).toBe('');

    childElement.removeAttribute('status');
    await elementIsStable(childElement);
    expect(childElement.index).toBe(1);
    expect(childElement.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).textContent).toBe('1');
  });

  it('should assign index to dynamically added steps', async () => {
    const newStep = document.createElement(StepsItem.metadata.tag) as StepsItem;
    parentElement.appendChild(newStep);
    await elementIsStable(parentElement);
    await elementIsStable(newStep);

    expect(newStep.index).toBe(3);
    expect(newStep.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).textContent).toBe('3');
  });

  it('should re-index remaining steps when a step is removed', async () => {
    childElements[0].remove();
    await elementIsStable(parentElement);

    const remaining = Array.from(parentElement.querySelectorAll<StepsItem>(StepsItem.metadata.tag));
    expect(remaining.length).toBe(1);
    await elementIsStable(remaining[0]);
    expect(remaining[0].index).toBe(1);
    expect(remaining[0].shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).textContent).toBe('1');
  });

  it('should propagate container to child steps', async () => {
    childElements.forEach(step => expect(step.container).toBeUndefined());

    parentElement.container = 'condensed';
    await elementIsStable(parentElement);

    childElements.forEach(step => expect(step.container).toBe('condensed'));
  });
});
