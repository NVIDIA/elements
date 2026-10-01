// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import type { StateScrollConfig } from '@nvidia-elements/core/internal';
import { stateScroll } from '@nvidia-elements/core/internal';

@stateScroll<StateScrollControllerTestElement>()
@customElement('state-scroll-controller-test-element')
class StateScrollControllerTestElement extends LitElement {
  declare _internals: ElementInternals;

  static styles = [css`:host { overflow: auto; width: 50px; height: 50px; display: block; }`];

  // defaults
  stateScrollConfig = {
    scrollOffset: 0,
    target: this
  } as StateScrollConfig;

  render() {
    return html`<div style="width: 100px; height: 100px;"></div>`;
  }
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 */
describe('state-scroll.controller', () => {
  let element: StateScrollControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<state-scroll-controller-test-element></state-scroll-controller-test-element>`);
    element = fixture.querySelector<StateScrollControllerTestElement>('state-scroll-controller-test-element');
    await elementIsStable(element);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    removeFixture(fixture);
    element._internals.states.delete('scrolling');
    vi.useRealTimers();
  });

  it('should initialize with no scrolling state', async () => {
    await elementIsStable(element);
    expect(element.matches(':state(scrolling)')).toBe(false);
  });

  it('should add scrolling state on scroll', async () => {
    const event = untilEvent(element, 'scroll');
    element.scrollLeft = 10;
    element.dispatchEvent(new Event('scroll', { bubbles: true }));
    await event;
    expect(element.matches(':state(scrolling)')).toBe(true);
  });

  it('should keep scrolling state for 100ms after scrollend', () => {
    element.dispatchEvent(new Event('scroll'));
    element.dispatchEvent(new Event('scrollend'));
    expect(element.matches(':state(scrolling)')).toBe(true);
    vi.advanceTimersByTime(99);
    expect(element.matches(':state(scrolling)')).toBe(true);
    vi.advanceTimersByTime(1);
    expect(element.matches(':state(scrolling)')).toBe(false);
  });

  it('should keep one scrolling state across closely spaced scroll bursts', () => {
    const addState = vi.spyOn(element._internals.states, 'add');
    const deleteState = vi.spyOn(element._internals.states, 'delete');
    element.dispatchEvent(new Event('scroll'));
    element.dispatchEvent(new Event('scrollend'));
    vi.advanceTimersByTime(60);
    element.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(100);
    expect(element.matches(':state(scrolling)')).toBe(true);
    expect(addState).toHaveBeenCalledOnce();
    expect(deleteState).not.toHaveBeenCalled();

    element.dispatchEvent(new Event('scrollend'));
    vi.advanceTimersByTime(100);
    expect(element.matches(':state(scrolling)')).toBe(false);
    expect(deleteState).toHaveBeenCalledOnce();
  });

  it('should restart the pending reset on repeated scrollend events', () => {
    const deleteState = vi.spyOn(element._internals.states, 'delete');
    element.dispatchEvent(new Event('scroll'));
    element.dispatchEvent(new Event('scrollend'));
    vi.advanceTimersByTime(60);
    element.dispatchEvent(new Event('scrollend'));
    vi.advanceTimersByTime(60);
    expect(element.matches(':state(scrolling)')).toBe(true);
    vi.advanceTimersByTime(40);
    expect(element.matches(':state(scrolling)')).toBe(false);
    expect(deleteState).toHaveBeenCalledOnce();
  });

  it('should cancel pending resets when disconnected and reconnected', async () => {
    element.dispatchEvent(new Event('scroll'));
    element.dispatchEvent(new Event('scrollend'));
    element.remove();
    expect(element.matches(':state(scrolling)')).toBe(false);
    fixture.append(element);
    await elementIsStable(element);
    element.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(100);
    expect(element.matches(':state(scrolling)')).toBe(true);
  });

  it('should cancel pending resets when the scroll target changes', async () => {
    element.dispatchEvent(new Event('scroll'));
    element.dispatchEvent(new Event('scrollend'));
    const target = element.shadowRoot.querySelector<HTMLElement>('div')!;
    element.stateScrollConfig.target = target;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.matches(':state(scrolling)')).toBe(false);
    target.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(100);
    expect(element.matches(':state(scrolling)')).toBe(true);
  });

  it('should dispatch scrollend event when scroll reaches end of scrollbox', async () => {
    const event = untilEvent(element, 'scrollboxend');
    element.scrollTop = 50;
    element.dispatchEvent(new Event('scroll'));
    element.dispatchEvent(new Event('scrollend'));
    const scrollboxEndEvent = await event;
    expect(scrollboxEndEvent).toBeTruthy();
    expect(scrollboxEndEvent.bubbles).toBe(true);
    expect(scrollboxEndEvent.composed).toBe(true);
    expect(element.matches(':state(scrolling)')).toBe(true);
    vi.advanceTimersByTime(100);
    expect(element.matches(':state(scrolling)')).toBe(false);
  });

  it('should account for scroll offset', async () => {
    element.stateScrollConfig.scrollOffset = 5;
    const event = untilEvent(element, 'scrollboxend');
    element.scrollTop = 45;
    element.dispatchEvent(new Event('scrollend'));
    await event;
    expect(await event).toBeTruthy();
  });

  it('should retain scrolling when a scrollboxend listener resumes scrolling', () => {
    Object.defineProperties(element, {
      scrollTop: { configurable: true, value: 50 },
      offsetHeight: { configurable: true, value: 50 },
      scrollHeight: { configurable: true, value: 100 }
    });
    element.addEventListener(
      'scrollboxend',
      () => {
        element.dispatchEvent(new Event('scroll'));
      },
      { once: true }
    );
    element.dispatchEvent(new Event('scroll'));
    element.dispatchEvent(new Event('scrollend'));
    vi.advanceTimersByTime(100);
    expect(element.matches(':state(scrolling)')).toBe(true);
  });

  it('should add scrolling state on scroll for custom target', async () => {
    const target = element.shadowRoot.querySelector<HTMLElement>('div')!;
    element.stateScrollConfig.target = target;
    element.requestUpdate();
    await elementIsStable(element);

    element.dispatchEvent(new Event('scroll', { bubbles: true }));
    expect(element.matches(':state(scrolling)')).toBe(false);

    const event = untilEvent(target, 'scroll');
    target.dispatchEvent(new Event('scroll', { bubbles: true }));
    await event;
    expect(element.matches(':state(scrolling)')).toBe(true);

    element.stateScrollConfig.target = undefined;
    element.requestUpdate();
    await elementIsStable(element);

    const eventElement = untilEvent(element, 'scroll');
    element.scrollLeft = 10;
    element.dispatchEvent(new Event('scroll', { bubbles: true }));
    await eventElement;
    expect(element.matches(':state(scrolling)')).toBe(true);
  });
});
