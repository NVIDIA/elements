// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { mediaCommands } from '../internal/media-command.js';
import { createMediaState, mediaStateChange, type MediaState } from '../internal/media-state.js';
import { MediaTimeRange } from './time-range.js';
import './define.js';

type MediaStateTarget = HTMLElement & { mediaState: MediaState };

describe(MediaTimeRange.metadata.tag, () => {
  let fixture: HTMLElement;
  let range: MediaTimeRange;
  let target: MediaStateTarget;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-media-time-range commandfor="target" name="currentTime"></nve-media-time-range>
      <div id="target"></div>
    `);
    range = getElement(fixture, MediaTimeRange.metadata.tag);
    target = getElement(fixture, '#target');
    setMediaState(target, { currentTime: 10, duration: 100 });
    await elementIsStable(range);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(MediaTimeRange.metadata.tag)).toBeDefined();
    expect(range.tabIndex).toBe(-1);
    expect(getElement<HTMLInputElement>(range.shadowRoot as ShadowRoot, 'input').tabIndex).toBe(0);
  });

  it('should sync value and bounds from the target controller', async () => {
    expect(range.value).toBe(10);
    expect(range.max).toBe(100);

    setMediaState(target, { currentTime: 0, duration: 0 });
    await elementIsStable(range);
    expect(range.value).toBe(0);
    expect(range.max).toBe(0);

    setMediaState(target, { currentTime: 25, duration: 120 });
    await elementIsStable(range);

    expect(range.value).toBe(25);
    expect(range.max).toBe(120);
  });

  it('should render disjoint buffered ranges from the array attribute', async () => {
    const bufferedFixture = await createFixture(html`
      <nve-media-time-range
        min="0"
        max="100"
        value="40"
        buffered-ranges='[{"start":-10,"end":20},{"start":80,"end":120}]'
      ></nve-media-time-range>
    `);
    const bufferedRange = getElement<MediaTimeRange>(bufferedFixture, MediaTimeRange.metadata.tag);
    await elementIsStable(bufferedRange);

    expect(bufferedRange.bufferedRanges).toEqual([
      { start: -10, end: 20 },
      { start: 80, end: 120 }
    ]);
    let segments = getBufferedSegments(bufferedRange);
    expect(segments).toHaveLength(2);
    expect(Number(segments[0]?.style.getPropertyValue('--buffered-range-start'))).toBe(0);
    expect(Number(segments[0]?.style.getPropertyValue('--buffered-range-size'))).toBeCloseTo(0.2);
    expect(Number(segments[1]?.style.getPropertyValue('--buffered-range-start'))).toBeCloseTo(0.8);
    expect(Number(segments[1]?.style.getPropertyValue('--buffered-range-size'))).toBeCloseTo(0.2);
    expect(segments.every(segment => segment.getAttribute('aria-hidden') === 'true')).toBe(true);

    bufferedRange.setAttribute('buffered-ranges', '[{"start":20,"end":10}]');
    await elementIsStable(bufferedRange);
    segments = getBufferedSegments(bufferedRange);
    expect(segments).toHaveLength(0);
    removeFixture(bufferedFixture);
  });

  it('should prefer controller buffered ranges while connected', async () => {
    range.bufferedRanges = [{ start: 70, end: 90 }];
    setMediaState(target, {
      buffered: [
        { start: 0, end: 20 },
        { start: 40, end: 50 }
      ],
      duration: 100
    });
    await elementIsStable(range);

    expect(getBufferedSegments(range)).toHaveLength(2);
    expect(range.bufferedRanges).toEqual([{ start: 70, end: 90 }]);

    range.commandfor = null;
    await elementIsStable(range);

    const segments = getBufferedSegments(range);
    expect(segments).toHaveLength(1);
    expect(Number(segments[0]?.style.getPropertyValue('--buffered-range-start'))).toBeCloseTo(0.7);
    expect(Number(segments[0]?.style.getPropertyValue('--buffered-range-size'))).toBeCloseTo(0.2);
  });

  it('should use i18n strings for the default accessible name', async () => {
    let input = getElement<HTMLInputElement>(range.shadowRoot as ShadowRoot, 'input');
    expect(input.getAttribute('aria-label')).toBe('current time');

    range.i18n = { currentTime: 'recording position' };
    await elementIsStable(range);
    input = getElement<HTMLInputElement>(range.shadowRoot as ShadowRoot, 'input');

    expect(input.getAttribute('aria-label')).toBe('recording position');
  });

  it('should show the duration when target media has ended', async () => {
    setMediaState(target, { currentTime: 99, duration: 100, ended: true });
    await elementIsStable(range);

    expect(range.value).toBe(100);
  });

  it('should ignore missing target state', async () => {
    range.commandfor = null;
    await elementIsStable(range);

    expect(range.value).toBe(10);
    expect(range.max).toBe(100);
  });

  it('should dispatch input, change, and seek command for user input', async () => {
    const inputEvent = untilEvent<InputEvent>(range, 'input');
    const changeEvent = untilEvent(range, 'change');
    const commandEvent = untilEvent<Event & { command: string; source: MediaTimeRange }>(target, 'command');
    const input = getElement<HTMLInputElement>(range.shadowRoot as ShadowRoot, 'input');

    input.value = '40';
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    expect((await inputEvent).data).toBe('40');
    expect(await changeEvent).toBeTruthy();
    expect((await commandEvent).command).toBe(mediaCommands.seek);
  });

  it('should reach the duration when user input moves to the end', async () => {
    setMediaState(target, { currentTime: 0, duration: 5.653333 });
    await elementIsStable(range);
    const input = getElement<HTMLInputElement>(range.shadowRoot as ShadowRoot, 'input');

    input.value = `${range.max}`;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await elementIsStable(range);

    expect(input.valueAsNumber).toBe(range.max);
    expect(range.value).toBe(range.max);
    expect(range.style.getPropertyValue('--track-progress')).toBe('1');
    const internalHost = getElement(range.shadowRoot as ShadowRoot, '[internal-host]');
    expect(getComputedStyle(internalHost, '::after').width).toBe(getComputedStyle(internalHost, '::before').width);
  });

  it('should not dispatch input or change during target synchronization', async () => {
    let events = 0;
    range.addEventListener('input', () => (events += 1));
    range.addEventListener('change', () => (events += 1));

    setMediaState(target, { currentTime: 55, duration: 100 });
    await elementIsStable(range);

    expect(events).toBe(0);
  });

  it('should ignore user input while target media is unavailable', async () => {
    let events = 0;
    let commands = 0;
    range.addEventListener('input', () => (events += 1));
    target.addEventListener('command', () => (commands += 1));

    setMediaState(target, { duration: 0 });
    await elementIsStable(range);
    const input = getElement<HTMLInputElement>(range.shadowRoot as ShadowRoot, 'input');
    input.valueAsNumber = 20;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));

    expect(events).toBe(0);
    expect(commands).toBe(0);
  });

  it('should submit numeric form data and validate bounds', async () => {
    const formFixture = await createFixture(html`
      <form>
        <nve-media-time-range name="currentTime" value="5" min="0" max="10" step="0.5"></nve-media-time-range>
      </form>
    `);
    const form = getElement<HTMLFormElement>(formFixture, 'form');
    const formRange = getElement<MediaTimeRange>(form, MediaTimeRange.metadata.tag);
    await elementIsStable(formRange);
    expect(new FormData(form).get('currentTime')).toBe('5');
    formRange.value = 11;
    await elementIsStable(formRange);
    expect(formRange.checkValidity()).toBe(false);
    removeFixture(formFixture);
  });
});

function getElement<T extends Element>(root: ParentNode, selector: string) {
  const element = root.querySelector<T>(selector);
  expect(element).toBeTruthy();
  return element as T;
}

function getBufferedSegments(range: MediaTimeRange) {
  return [...(range.shadowRoot as ShadowRoot).querySelectorAll<HTMLElement>('.buffered-range')];
}

function setMediaState(target: MediaStateTarget, state: Partial<MediaState>) {
  target.mediaState = createMediaState(state);
  target.dispatchEvent(new CustomEvent(mediaStateChange, { detail: target.mediaState }));
}
