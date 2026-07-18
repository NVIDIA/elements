// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { mediaCommands } from '../internal/media-command.js';
import { createMediaState, mediaStateChange, type MediaState } from '../internal/media-state.js';
import { MediaPlaybackRateSelect } from './playback-rate-select.js';
import './define.js';

type MediaStateTarget = HTMLElement & { mediaState: MediaState };

describe(MediaPlaybackRateSelect.metadata.tag, () => {
  let fixture: HTMLElement;
  let select: MediaPlaybackRateSelect;
  let target: MediaStateTarget;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-media-playback-rate-select commandfor="target" name="rate" value="1"></nve-media-playback-rate-select>
      <div id="target"></div>
    `);
    select = getElement(fixture, MediaPlaybackRateSelect.metadata.tag);
    target = getElement(fixture, '#target');
    setMediaState(target, { playbackRate: 1 });
    await elementIsStable(select);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(MediaPlaybackRateSelect.metadata.tag)).toBeDefined();
    expect(select.tabIndex).toBe(-1);
    expect(getElement<HTMLSelectElement>(select.shadowRoot as ShadowRoot, 'select').tabIndex).toBe(0);
  });

  it('should default to normal playback speed', async () => {
    const defaultFixture = await createFixture(html`<nve-media-playback-rate-select></nve-media-playback-rate-select>`);
    const defaultSelect = getElement<MediaPlaybackRateSelect>(defaultFixture, MediaPlaybackRateSelect.metadata.tag);
    await elementIsStable(defaultSelect);

    expect(defaultSelect.value).toBe('1');
    expect(defaultSelect.selectedIndex).toBe(1);

    removeFixture(defaultFixture);
  });

  it('should expose native select form APIs', () => {
    expect(select.type).toBe('select-one');
    expect(select.length).toBe(4);
    expect(select.options.map(option => option.value)).toEqual(['0.5', '1', '1.5', '2']);
    expect(select.value).toBe('1');
    expect(select.valueAsNumber).toBe(1);
    expect(select.selectedIndex).toBe(1);
    expect(select.selectedOptions.map(option => option.value)).toEqual(['1']);
  });

  it('should render array rates', async () => {
    select.rates = [0.25, 0.5, 1, 2];
    await elementIsStable(select);

    expect(select.options.map(option => option.value)).toEqual(['0.25', '0.5', '1', '2']);
  });

  it('should use i18n strings for its accessible name and option text', async () => {
    let nativeSelect = getElement<HTMLSelectElement>(select.shadowRoot as ShadowRoot, 'select');
    expect(nativeSelect.getAttribute('aria-label')).toBe('playback rate');
    expect(nativeSelect.options[0].text).toBe('0.5x');

    select.i18n = { playbackRate: 'speed', playbackRateOption: '{rate} times' };
    await elementIsStable(select);
    nativeSelect = getElement<HTMLSelectElement>(select.shadowRoot as ShadowRoot, 'select');

    expect(nativeSelect.getAttribute('aria-label')).toBe('speed');
    expect(nativeSelect.options[0].text).toBe('0.5 times');
  });

  it('should render transparent closed control styles', () => {
    const nativeSelect = getElement<HTMLSelectElement>(select.shadowRoot as ShadowRoot, 'select');

    expect(getComputedStyle(nativeSelect).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(nativeSelect).borderTopWidth).toBe('0px');
  });

  it('should sync value from the target controller', async () => {
    const input = vi.fn();
    const change = vi.fn();
    select.addEventListener('input', input);
    select.addEventListener('change', change);

    setMediaState(target, { playbackRate: 1.5 });
    await elementIsStable(select);

    expect(select.value).toBe('1.5');
    expect(input).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
  });

  it('should dispatch playback-rate command for committed user changes', async () => {
    const commandEvent = untilEvent<Event & { command: string; source: MediaPlaybackRateSelect }>(target, 'command');
    const nativeSelect = getElement<HTMLSelectElement>(select.shadowRoot as ShadowRoot, 'select');

    nativeSelect.value = '2';
    nativeSelect.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    const command = await commandEvent;
    expect(command.command).toBe(mediaCommands.setPlaybackRate);
    expect(command.source.value).toBe('2');
    expect(command.source.valueAsNumber).toBe(2);
  });

  it('should dispatch host input and change events for user changes', async () => {
    const inputEvent = untilEvent(select, 'input');
    const changeEvent = untilEvent(select, 'change');
    const nativeSelect = getElement<HTMLSelectElement>(select.shadowRoot as ShadowRoot, 'select');

    nativeSelect.value = '1.5';
    nativeSelect.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    nativeSelect.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    expect(await inputEvent).toBeDefined();
    expect(await changeEvent).toBeDefined();
  });

  it('should submit selected form data', async () => {
    const formFixture = await createFixture(html`
      <form>
        <nve-media-playback-rate-select
          name="rate"
          value="1.5"
          rates="[0.25, 0.5, 1.5, 2]"
        ></nve-media-playback-rate-select>
      </form>
    `);
    const form = getElement<HTMLFormElement>(formFixture, 'form');
    const formSelect = getElement<MediaPlaybackRateSelect>(form, MediaPlaybackRateSelect.metadata.tag);
    await elementIsStable(formSelect);

    expect(formSelect.options.map(option => option.value)).toEqual(['0.25', '0.5', '1.5', '2']);
    expect(new FormData(form).get('rate')).toBe('1.5');

    formSelect.selectedIndex = 3;
    await elementIsStable(formSelect);
    expect(new FormData(form).get('rate')).toBe('2');

    formSelect.formStateRestoreCallback('0.5');
    expect(formSelect.value).toBe('0.5');

    formSelect.formStateRestoreCallback(null);
    expect(formSelect.value).toBe('1.5');

    formSelect.value = '2';
    formSelect.formResetCallback();
    expect(formSelect.value).toBe('1.5');

    removeFixture(formFixture);
  });

  it('should validate required missing values', async () => {
    select.required = true;
    select.value = '3';
    await elementIsStable(select);

    expect(select.value).toBe('');
    expect(select.checkValidity()).toBe(false);
    expect(select.validity.valueMissing).toBe(true);
  });

  it('should render readonly and disabled native select states', async () => {
    select.readOnly = true;
    await elementIsStable(select);
    let nativeSelect = getElement<HTMLSelectElement>(select.shadowRoot as ShadowRoot, 'select');

    expect(nativeSelect.disabled).toBe(true);
    expect(nativeSelect.getAttribute('aria-readonly')).toBe('true');

    select.readOnly = false;
    select.disabled = true;
    await elementIsStable(select);
    nativeSelect = getElement<HTMLSelectElement>(select.shadowRoot as ShadowRoot, 'select');

    expect(nativeSelect.disabled).toBe(true);
  });
});

function getElement<T extends Element>(root: ParentNode, selector: string) {
  const element = root.querySelector<T>(selector);
  expect(element).toBeTruthy();
  return element as T;
}

function setMediaState(target: MediaStateTarget, state: Partial<MediaState>) {
  target.mediaState = createMediaState(state);
  target.dispatchEvent(new CustomEvent(mediaStateChange, { detail: target.mediaState }));
}
