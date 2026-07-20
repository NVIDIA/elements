// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type TemplateResult } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import type { ButtonFormControlMixinInstance } from '@nvidia-elements/forms/mixins';
import { Button } from '@nvidia-elements/core/button';
import { MenuItem } from '@nvidia-elements/core/menu';
import { SortButton } from '@nvidia-elements/core/sort-button';
import { StepsItem } from '@nvidia-elements/core/steps';
import { TabsItem } from '@nvidia-elements/core/tabs';
import { Tag } from '@nvidia-elements/core/tag';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/sort-button/define.js';
import '@nvidia-elements/core/steps/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/tag/define.js';

interface ButtonUsage {
  tag: string;
  expectedRole: string;
  expectedType?: string;
  template: TemplateResult;
  submitTemplate: TemplateResult;
}

type ButtonElement = HTMLElement & ButtonFormControlMixinInstance & { _internals: ElementInternals };

const usages: ButtonUsage[] = [
  {
    tag: Button.metadata.tag,
    expectedRole: 'button',
    template: html`<nve-button commandfor="target">button</nve-button>`,
    submitTemplate: html`<nve-button type="submit" name="button-name" value="button-value" commandfor="target">button</nve-button>`
  },
  {
    tag: MenuItem.metadata.tag,
    expectedRole: 'menuitem',
    expectedType: 'button',
    template: html`<nve-menu><nve-menu-item commandfor="target">item</nve-menu-item></nve-menu>`,
    submitTemplate: html`<nve-menu><nve-menu-item type="submit" name="button-name" value="button-value" commandfor="target">item</nve-menu-item></nve-menu>`
  },
  {
    tag: SortButton.metadata.tag,
    expectedRole: 'spinbutton',
    expectedType: 'button',
    template: html`<nve-sort-button commandfor="target"></nve-sort-button>`,
    submitTemplate: html`<nve-sort-button type="submit" name="button-name" value="button-value" commandfor="target"></nve-sort-button>`
  },
  {
    tag: StepsItem.metadata.tag,
    expectedRole: 'tab',
    expectedType: 'button',
    template: html`<nve-steps><nve-steps-item commandfor="target">step</nve-steps-item></nve-steps>`,
    submitTemplate: html`<nve-steps><nve-steps-item type="submit" name="button-name" value="button-value" commandfor="target">step</nve-steps-item></nve-steps>`
  },
  {
    tag: TabsItem.metadata.tag,
    expectedRole: 'tab',
    expectedType: 'button',
    template: html`<nve-tabs><nve-tabs-item commandfor="target">tab</nve-tabs-item></nve-tabs>`,
    submitTemplate: html`<nve-tabs><nve-tabs-item type="submit" name="button-name" value="button-value" commandfor="target">tab</nve-tabs-item></nve-tabs>`
  },
  {
    tag: Tag.metadata.tag,
    expectedRole: 'button',
    expectedType: 'button',
    template: html`<nve-tag commandfor="target">tag</nve-tag>`,
    submitTemplate: html`<nve-tag type="submit" name="button-name" value="button-value" commandfor="target">tag</nve-tag>`
  }
];

describe('ButtonFormControlMixin core usage', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  usages.forEach(usage => {
    describe(usage.tag, () => {
      it('should expose role, focus, and type behavior', async () => {
        const button = await createButton(usage);

        expect(button._internals.role).toBe(usage.expectedRole);
        expect(button.tabIndex).toBe(0);
        expect(button.type).toBe(usage.expectedType);
      });

      it('should sync disabled and readonly states', async () => {
        const button = await createButton(usage);

        button.disabled = true;
        await elementIsStable(button);
        expect(button._internals.ariaDisabled).toBe('true');
        expect(button.matches(':state(disabled)')).toBe(true);
        expect(button.tabIndex).toBe(-1);

        button.disabled = false;
        button.readOnly = true;
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
        expect((await command).command).toBe('--test-command');

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
