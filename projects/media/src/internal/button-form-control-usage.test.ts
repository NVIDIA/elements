// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type TemplateResult } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import type { ButtonFormControlMixinInstance } from '@nvidia-elements/forms/mixins';
import { MediaFullscreenButton } from '../fullscreen-button/fullscreen-button.js';
import { MediaMuteButton } from '../mute-button/mute-button.js';
import { MediaPauseButton } from '../pause-button/pause-button.js';
import { MediaSeekButton } from '../seek-button/seek-button.js';
import '../fullscreen-button/define.js';
import '../mute-button/define.js';
import '../pause-button/define.js';
import '../seek-button/define.js';

interface ButtonUsage {
  tag: string;
  checkbox?: boolean;
  template: TemplateResult;
  submitTemplate: TemplateResult;
}

type ButtonElement = HTMLElement & ButtonFormControlMixinInstance & { _internals: ElementInternals };
type CheckboxButtonElement = ButtonElement & { checked: boolean };

const usages: ButtonUsage[] = [
  {
    tag: MediaFullscreenButton.metadata.tag,
    template: html`<nve-media-fullscreen-button commandfor="target"></nve-media-fullscreen-button>`,
    submitTemplate: html`<nve-media-fullscreen-button type="submit" name="button-name" value="button-value" commandfor="target"></nve-media-fullscreen-button>`
  },
  {
    tag: MediaMuteButton.metadata.tag,
    checkbox: true,
    template: html`<nve-media-mute-button commandfor="target"></nve-media-mute-button>`,
    submitTemplate: html`<nve-media-mute-button checked name="button-name" value="button-value"></nve-media-mute-button>`
  },
  {
    tag: MediaPauseButton.metadata.tag,
    checkbox: true,
    template: html`<nve-media-pause-button commandfor="target"></nve-media-pause-button>`,
    submitTemplate: html`<nve-media-pause-button checked name="button-name" value="button-value"></nve-media-pause-button>`
  },
  {
    tag: MediaSeekButton.metadata.tag,
    template: html`<nve-media-seek-button commandfor="target"></nve-media-seek-button>`,
    submitTemplate: html`<nve-media-seek-button type="submit" name="button-name" value="button-value" commandfor="target"></nve-media-seek-button>`
  }
];

describe('ButtonFormControlMixin media usage', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  usages.forEach(usage => {
    describe(usage.tag, () => {
      it('should expose role and focus behavior', async () => {
        const button = await createButton(usage);

        expect(button._internals.role).toBe('button');
        expect(button.tabIndex).toBe(0);
      });

      it('should sync disabled and readonly states', async () => {
        const button = await createButton(usage);

        button.disabled = true;
        await elementIsStable(button);
        expect(button._internals.ariaDisabled).toBe('true');
        expect(button.matches(':state(disabled)')).toBe(true);
        expect(button.tabIndex).toBe(-1);

        button.disabled = false;
        button.readonly = true;
        await elementIsStable(button);
        expect(button.readOnly).toBe(true);
        expect(button.hasAttribute('readonly')).toBe(true);
        expect(button._internals.role).toBe('none');
        expect(button._internals.ariaDisabled).toBe(null);
      });

      it('should sync active, pressed, and expanded states', async () => {
        const button = await createButton(usage);

        button.dispatchEvent(new MouseEvent('mousedown'));
        expect(button.matches(':state(active)')).toBe(true);
        button.dispatchEvent(new MouseEvent('mouseup'));
        expect(button.matches(':state(active)')).toBe(false);

        button.pressed = true;
        button.expanded = true;
        await elementIsStable(button);
        expect(button._internals.ariaPressed).toBe('true');
        expect(button._internals.ariaExpanded).toBe('true');
      });

      it('should dispatch commands and suppress interaction while unavailable', async () => {
        const button = await createButton(usage);
        const target = getElement<HTMLElement>(fixture, '#target');
        button.command = '--test-command';
        await elementIsStable(button);

        const command = untilEvent<Event & { command: string; source: HTMLElement }>(target, 'command');
        emulateClick(button);
        expect((await command).source).toBe(button);

        let count = 0;
        target.addEventListener('command', () => (count += 1));
        button.disabled = true;
        await elementIsStable(button);
        emulateClick(button);
        button.disabled = false;
        button.readOnly = true;
        await elementIsStable(button);
        emulateClick(button);
        expect(count).toBe(0);
      });

      if (usage.checkbox) {
        it('should contribute checkbox form data when checked', async () => {
          const button = await createSubmitButton(usage);
          const form = getElement<HTMLFormElement>(fixture, 'form');

          expect(new FormData(form).get('button-name')).toBe('button-value');
          (button as CheckboxButtonElement).checked = false;
          await elementIsStable(button);
          expect(new FormData(form).get('button-name')).toBe(null);
        });

        return;
      }

      it('should submit with name and value when type is submit', async () => {
        const button = await createSubmitButton(usage);
        const form = getElement<HTMLFormElement>(fixture, 'form');
        form.addEventListener('submit', event => event.preventDefault());

        const submit = untilEvent<SubmitEvent>(form, 'submit');
        emulateClick(button);
        const event = await submit;

        expect(event.submitter?.name).toBe('button-name');
        expect(event.submitter?.value).toBe('button-value');
        expect(event.submitter?.form).toBe(form);
      });
    });
  });

  async function createButton({ template, tag }: ButtonUsage) {
    fixture = await createFixture(html`
      ${template}
      <div id="target"></div>
    `);
    const button = getElement<ButtonElement>(fixture, tag);
    await elementIsStable(button);
    return button;
  }

  async function createSubmitButton({ submitTemplate, tag }: ButtonUsage) {
    fixture = await createFixture(html`
      <form>
        ${submitTemplate}
      </form>
      <div id="target"></div>
    `);
    const button = getElement<ButtonElement>(fixture, tag);
    await elementIsStable(button);
    return button;
  }
});

function getElement<T extends Element>(root: ParentNode, selector: string) {
  const element = root.querySelector<T>(selector);
  expect(element).toBeTruthy();
  return element as T;
}
