// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { mediaCommands } from '../internal/media-command.js';
import { createMediaState, mediaStateChange, type MediaState } from '../internal/media-state.js';
import { MediaVolumeRange } from './volume-range.js';
import './define.js';

type MediaStateTarget = HTMLElement & { mediaState: MediaState };

describe(MediaVolumeRange.metadata.tag, () => {
  let fixture: HTMLElement;
  let range: MediaVolumeRange;
  let target: MediaStateTarget;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-media-volume-range commandfor="target" name="volume"></nve-media-volume-range>
      <div id="target"></div>
    `);
    range = getElement(fixture, MediaVolumeRange.metadata.tag);
    target = getElement(fixture, '#target');
    setMediaState(target, { volume: 0.4 });
    await elementIsStable(range);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(MediaVolumeRange.metadata.tag)).toBeDefined();
    expect(range.tabIndex).toBe(-1);
    expect(getElement<HTMLInputElement>(range.shadowRoot as ShadowRoot, 'input').tabIndex).toBe(0);
  });

  it('should sync value from the target controller', async () => {
    const input = vi.fn();
    const change = vi.fn();
    range.addEventListener('input', input);
    range.addEventListener('change', change);
    expect(range.value).toBe(0.4);

    setMediaState(target, { volume: 1 });
    await elementIsStable(range);
    expect(range.value).toBe(1);

    setMediaState(target, { volume: 0.8 });
    await elementIsStable(range);
    expect(range.value).toBe(0.8);
    expect(input).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
  });

  it('should use i18n strings for the default accessible name', async () => {
    let input = getElement<HTMLInputElement>(range.shadowRoot as ShadowRoot, 'input');
    expect(input.getAttribute('aria-label')).toBe('volume');

    range.i18n = { volume: 'recording volume' };
    await elementIsStable(range);
    input = getElement<HTMLInputElement>(range.shadowRoot as ShadowRoot, 'input');

    expect(input.getAttribute('aria-label')).toBe('recording volume');
  });

  it('should ignore missing target state', async () => {
    range.commandfor = null;
    await elementIsStable(range);

    expect(range.value).toBe(0.4);
  });

  it('should dispatch set-volume command for user input', async () => {
    const commandEvent = untilEvent<Event & { command: string; source: MediaVolumeRange }>(target, 'command');
    const input = getElement<HTMLInputElement>(range.shadowRoot as ShadowRoot, 'input');

    input.valueAsNumber = 0.6;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));

    const command = await commandEvent;
    expect(command.command).toBe(mediaCommands.setVolume);
    expect(command.source.valueAsNumber).toBe(0.6);
  });

  it('should submit numeric form data', async () => {
    const formFixture = await createFixture(html`
      <form>
        <nve-media-volume-range name="volume" value="0.7" min="0" max="1" step="0.1"></nve-media-volume-range>
      </form>
    `);
    const form = getElement<HTMLFormElement>(formFixture, 'form');
    const formRange = getElement<MediaVolumeRange>(form, MediaVolumeRange.metadata.tag);
    await elementIsStable(formRange);
    expect(new FormData(form).get('volume')).toBe('0.7');
    removeFixture(formFixture);
  });

  it('should expose numeric form APIs and validation states', async () => {
    const formFixture = await createFixture(html`
      <form>
        <nve-media-volume-range name="volume" value="0.5" min="0" max="1" step="0.25" required></nve-media-volume-range>
      </form>
    `);
    const form = getElement<HTMLFormElement>(formFixture, 'form');
    const formRange = getElement<MediaVolumeRange>(form, MediaVolumeRange.metadata.tag);
    await elementIsStable(formRange);

    expect(formRange.form).toBe(form);
    expect(formRange.willValidate).toBe(true);
    expect(formRange.validity.valid).toBe(true);
    expect(formRange.validationMessage).toBe('');

    formRange.valueAsNumber = 0.75;
    await elementIsStable(formRange);
    expect(new FormData(form).get('volume')).toBe('0.75');

    formRange.valueAsNumber = -1;
    await elementIsStable(formRange);
    expect(formRange.checkValidity()).toBe(false);
    expect(formRange.validity.rangeUnderflow).toBe(true);

    formRange.valueAsNumber = 2;
    await elementIsStable(formRange);
    expect(formRange.checkValidity()).toBe(false);
    expect(formRange.validity.rangeOverflow).toBe(true);

    formRange.valueAsNumber = 0.3;
    await elementIsStable(formRange);
    expect(formRange.checkValidity()).toBe(false);
    expect(formRange.validity.stepMismatch).toBe(true);

    formRange.valueAsNumber = Number.NaN;
    await elementIsStable(formRange);
    expect(formRange.checkValidity()).toBe(false);
    expect(formRange.validity.valueMissing).toBe(true);

    formRange.step = 0;
    formRange.valueAsNumber = 0.3;
    await elementIsStable(formRange);
    expect(formRange.reportValidity()).toBe(true);

    formRange.formStateRestoreCallback('0.25');
    expect(formRange.valueAsNumber).toBe(0.25);
    formRange.formStateRestoreCallback(null);
    expect(formRange.valueAsNumber).toBe(0.5);

    formRange.valueAsNumber = 0.75;
    formRange.formResetCallback();
    expect(formRange.valueAsNumber).toBe(0.5);

    formRange.disabled = true;
    await elementIsStable(formRange);
    expect(getInternals(formRange).ariaDisabled).toBe('true');
    expect(new FormData(form).get('volume')).toBe(null);

    removeFixture(formFixture);
  });

  it('should render readonly range state', async () => {
    range.readOnly = true;
    await elementIsStable(range);
    const input = getElement<HTMLInputElement>(range.shadowRoot as ShadowRoot, 'input');

    expect(input.disabled).toBe(true);
    expect(input.getAttribute('aria-readonly')).toBe('true');
    expect(getInternals(range).ariaDisabled).toBe(null);
  });
});

function getElement<T extends Element>(root: ParentNode, selector: string) {
  const element = root.querySelector<T>(selector);
  expect(element).toBeTruthy();
  return element as T;
}

function getInternals(element: HTMLElement) {
  return (element as HTMLElement & { _internals: ElementInternals })._internals;
}

function setMediaState(target: MediaStateTarget, state: Partial<MediaState>) {
  target.mediaState = createMediaState(state);
  target.dispatchEvent(new CustomEvent(mediaStateChange, { detail: target.mediaState }));
}
