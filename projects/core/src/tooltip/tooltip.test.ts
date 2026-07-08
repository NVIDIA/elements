// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  createFixture,
  removeFixture,
  elementIsStable,
  emulateClick,
  emulateMouseEnter,
  untilEvent
} from '@internals/testing';
import { Tooltip } from '@nvidia-elements/core/tooltip';
import { Button } from '@nvidia-elements/core/button';
import type { Dropdown } from '@nvidia-elements/core/dropdown';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dropdown/define.js';

describe(Tooltip.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Tooltip;
  let trigger: Button;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tooltip id="tooltip">hello</nve-tooltip>
      <nve-button interestfor="tooltip">button</nve-button>
    `);
    element = fixture.querySelector('#tooltip');
    trigger = fixture.querySelector(Button.metadata.tag);
    element.hidePopover();
    await elementIsStable(element);
  });

  afterEach(() => {
    vi.useRealTimers();
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Tooltip.metadata.tag)).toBeDefined();
  });

  it('should render arrow by default', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.arrow').tagName).toBe('DIV');
  });

  // https://open-ui.org/components/popup.research.explainer#api-shape
  it('should default to hint behavior', async () => {
    await elementIsStable(element);
    expect(element.popoverType).toBe('hint');
  });

  it('should open hint popover type should set the popover attribute type to manual to avoid closing other open popover="auto" elements', async () => {
    await elementIsStable(element);

    // type hint will close other type hint popovers but not auto popovers
    // browsers that do not support type hint will fall back to manual
    expect(element.popover).toBe('hint');
  });

  it('should default to positioning on the top of an anchor', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('top');
  });

  it('should initialize role type of tooltip', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('tooltip');
  });

  it('should default with an interest delay start set 0.5s', async () => {
    await elementIsStable(element);
    expect(getComputedStyle(element).getPropertyValue('interest-delay-start')).toBe('0.5s');
  });

  it('should reflect status attribute to DOM', async () => {
    expect(element.hasAttribute('status')).toBe(false);
    element.status = 'muted';
    await elementIsStable(element);
    expect(element.getAttribute('status')).toBe('muted');
  });

  it('should display the tooltip after the interest delay', async () => {
    vi.useFakeTimers();
    element.style.setProperty('interest-delay-start', '50ms');
    await elementIsStable(element);

    emulateMouseEnter(trigger);
    vi.advanceTimersByTime(49);
    expect(element.matches(':popover-open')).toBe(false);

    vi.advanceTimersByTime(1);
    expect(element.matches(':popover-open')).toBe(true);
  });
});

describe(`${Tooltip.metadata.tag}: popover interest handover`, () => {
  let fixture: HTMLElement;
  let element: Tooltip;
  let dropdown: Dropdown;
  let trigger: Button;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tooltip id="tooltip">hello</nve-tooltip>
      <nve-dropdown id="dropdown"></nve-dropdown>
      <nve-button interestfor="tooltip" popovertarget="dropdown">button</nve-button>
    `);
    element = fixture.querySelector('#tooltip');
    dropdown = fixture.querySelector('#dropdown');
    trigger = fixture.querySelector(Button.metadata.tag);
    await elementIsStable(element);
    await elementIsStable(dropdown);
    await elementIsStable(trigger);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    removeFixture(fixture);
  });

  it('should hide an open tooltip when its trigger opens an interactive popover', async () => {
    element.style.setProperty('interest-delay-start', '0s');
    await elementIsStable(element);

    const tooltipOpen = untilEvent(element, 'open');
    emulateMouseEnter(trigger);
    await tooltipOpen;
    expect(element.matches(':popover-open')).toBe(true);

    const dropdownOpen = untilEvent(dropdown, 'open');
    emulateClick(trigger);
    await dropdownOpen;
    expect(element.matches(':popover-open')).toBe(false);
    expect(trigger.popoverTargetElement).toBe(dropdown);
    expect(dropdown.matches(':popover-open')).toBe(true);

    emulateMouseEnter(trigger);
    expect(element.matches(':popover-open')).toBe(false);
  });

  it('should cancel a pending tooltip when its trigger opens an interactive popover', async () => {
    vi.useFakeTimers();
    element.style.setProperty('interest-delay-start', '50ms');
    await elementIsStable(element);

    emulateMouseEnter(trigger);
    emulateClick(trigger);
    expect(trigger.popoverTargetElement).toBe(dropdown);
    expect(dropdown.matches(':popover-open')).toBe(true);
    vi.advanceTimersByTime(50);

    expect(element.matches(':popover-open')).toBe(false);
  });

  it('should preserve a pending tooltip when opening the interactive popover is canceled', async () => {
    vi.useFakeTimers();
    element.style.setProperty('interest-delay-start', '50ms');
    dropdown.addEventListener('beforetoggle', event => event.preventDefault(), { once: true });
    await elementIsStable(element);

    emulateMouseEnter(trigger);
    emulateClick(trigger);
    expect(dropdown.matches(':popover-open')).toBe(false);
    vi.advanceTimersByTime(50);

    expect(element.matches(':popover-open')).toBe(true);
  });

  it('should not revive a tooltip when dismissal restores non-focus-visible focus', async () => {
    const focusVisibleMatch = vi.spyOn(trigger, 'matches').mockReturnValue(false);

    emulateClick(trigger);
    dropdown.hidePopover();
    trigger.dispatchEvent(new FocusEvent('focus'));

    expect(element.matches(':popover-open')).toBe(false);
    expect(focusVisibleMatch).toHaveBeenCalledWith(':focus-visible');
  });
});
