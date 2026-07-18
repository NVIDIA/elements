// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { mediaCommands } from '../internal/media-command.js';
import { MediaSeekButton } from './seek-button.js';
import './define.js';

describe(MediaSeekButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let button: MediaSeekButton;
  let target: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-media-seek-button commandfor="target" action="backward" value="10"></nve-media-seek-button>
      <div id="target"></div>
    `);
    button = getElement(fixture, MediaSeekButton.metadata.tag);
    target = getElement(fixture, '#target');
    await elementIsStable(button);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(MediaSeekButton.metadata.tag)).toBeDefined();
  });

  it('should derive command from action and expose valueAsNumber on the source', async () => {
    const event = untilEvent<Event & { command: string; source: MediaSeekButton }>(target, 'command');
    await emulateClick(button);
    const command = await event;

    expect(command.command).toBe(mediaCommands.seekBackward);
    expect(command.source.valueAsNumber).toBe(10);
  });

  it('should derive backward command when existing markup upgrades', async () => {
    const tag = `late-media-seek-button-${crypto.randomUUID()}`;
    removeFixture(fixture);
    fixture = await createFixture(html`<div id="late-target"></div>`);
    button = document.createElement(tag) as MediaSeekButton;
    button.setAttribute('commandfor', 'late-target');
    button.setAttribute('action', 'backward');
    button.setAttribute('value', '10');
    fixture.prepend(button);

    customElements.define(tag, class extends MediaSeekButton {});
    target = getElement(fixture, '#late-target');
    await elementIsStable(button);

    expect(button.action).toBe('backward');

    const event = untilEvent<Event & { command: string; source: MediaSeekButton }>(target, 'command');
    await emulateClick(button);
    const command = await event;

    expect(command.command).toBe(mediaCommands.seekBackward);
    expect(command.source.valueAsNumber).toBe(10);
  });

  it('should sync valueAsNumber with value', async () => {
    button.valueAsNumber = 12;
    await elementIsStable(button);

    expect(button.value).toBe('12');
    expect(button.getAttribute('value')).toBe('12');
    expect(button.valueAsNumber).toBe(12);
  });

  it('should update derived command when action changes', async () => {
    button.action = 'end';
    await elementIsStable(button);

    const event = untilEvent<Event & { command: string }>(target, 'command');
    await emulateClick(button);
    expect((await event).command).toBe(mediaCommands.seekToEnd);
  });

  it('should preserve an explicit command attribute', async () => {
    const commandFixture = await createFixture(html`
      <nve-media-seek-button commandfor="seek-target" command="--seek" action="end"></nve-media-seek-button>
      <div id="seek-target"></div>
    `);
    const explicitButton = getElement<MediaSeekButton>(commandFixture, MediaSeekButton.metadata.tag);
    const explicitTarget = getElement(commandFixture, '#seek-target');
    await elementIsStable(explicitButton);

    const event = untilEvent<Event & { command: string }>(explicitTarget, 'command');
    await emulateClick(explicitButton);
    expect((await event).command).toBe(mediaCommands.seek);
    removeFixture(commandFixture);
  });

  it('should update labels for every seek action', async () => {
    button.action = 'start';
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('seek to start');
    expect(getElement(getShadowRoot(button), '[part="icon"]').getAttribute('name')).toBe('start');
    expect(getElement(getShadowRoot(button), '[part="icon"]').hasAttribute('direction')).toBe(false);

    button.action = 'backward';
    button.value = '5';
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('seek backward 5 seconds');

    button.action = 'forward';
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('seek forward 5 seconds');

    button.value = '10';
    await elementIsStable(button);
    expect(getElement(getShadowRoot(button), '[part="icon"]').getAttribute('name')).toBe('fast-forward-10');
    expect(getElement(getShadowRoot(button), '[part="icon"]').hasAttribute('direction')).toBe(false);

    button.action = 'end';
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('seek to end');
    expect(getElement(getShadowRoot(button), '[part="icon"]').getAttribute('name')).toBe('start');
    expect(getElement(getShadowRoot(button), '[part="icon"]').getAttribute('direction')).toBe('down');

    button.action = 'forward';
    await elementIsStable(button);
    expect(getElement(getShadowRoot(button), '[part="icon"]').getAttribute('name')).toBe('fast-forward-10');
    expect(getElement(getShadowRoot(button), '[part="icon"]').hasAttribute('direction')).toBe(false);
  });

  it('should use i18n strings for the default accessible name', async () => {
    button.i18n = {
      seekBackward: 'rewind {value} seconds',
      seekForward: 'advance {value} seconds',
      seekToEnd: 'jump to finish',
      seekToStart: 'jump to beginning'
    };
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('rewind 10 seconds');

    button.action = 'start';
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('jump to beginning');
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

function getShadowRoot(element: HTMLElement) {
  return element.shadowRoot as ShadowRoot;
}
