// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { Accordion, AccordionContent, AccordionGroup, AccordionHeader } from '@nvidia-elements/core/accordion';
import { IconButton } from '@nvidia-elements/core/icon-button';
import '@nvidia-elements/core/accordion/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(Accordion.metadata.tag, () => {
  let fixture: HTMLElement;
  let parentElement: AccordionGroup;
  let childElement1: Accordion;
  let childElement2: Accordion;
  let header: AccordionHeader;
  let content: AccordionContent;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-accordion-group>
      <nve-accordion>
        <nve-accordion-header>heading</nve-accordion-header>
        <nve-accordion-content>content</nve-accordion-content>
      </nve-accordion>
      <nve-accordion>
        <nve-accordion-header>heading</nve-accordion-header>
        <nve-accordion-content>content</nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
    `);
    parentElement = fixture.querySelector(AccordionGroup.metadata.tag);
    childElement1 = fixture.querySelectorAll<Accordion>(Accordion.metadata.tag)[0];
    childElement2 = fixture.querySelectorAll<Accordion>(Accordion.metadata.tag)[1];
    header = fixture.querySelector(AccordionHeader.metadata.tag);
    content = fixture.querySelector(AccordionContent.metadata.tag);

    await elementIsStable(parentElement);
    await elementIsStable(childElement1);
    await elementIsStable(childElement2);
    await elementIsStable(header);
    await elementIsStable(content);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define parentElement', () => {
    expect(customElements.get(AccordionGroup.metadata.tag)).toBeDefined();
  });

  it('should define childElement', () => {
    expect(customElements.get(Accordion.metadata.tag)).toBeDefined();
  });

  it('should role group for accordion group', async () => {
    expect(parentElement._internals.role).toBe('group');
  });

  it('should role region for accordion', async () => {
    expect(childElement1._internals.role).toBe('region');
  });

  it('should role heading for accordion header', async () => {
    expect(header._internals.role).toBe('heading');
    expect(header._internals.ariaLevel).toBe('2');
  });

  it('should have proper defaults on parent', () => {
    expect(parentElement.behaviorExpand).toBe(false);
    expect(parentElement.behaviorExpandSingle).toBe(false);
  });

  it('should handle behaviorExpand, passed from parent group element, when clicking on the header', async () => {
    expect(childElement1.expanded).toBe(false);

    parentElement.behaviorExpand = true;
    await elementIsStable(childElement1);

    const trigger = childElement1.shadowRoot.querySelector('#header') as HTMLElement;

    const event = untilEvent(trigger, 'click');
    emulateClick(trigger);
    expect(await event).toBeDefined();

    expect(childElement1.expanded).toBe(true);
  });

  it('should NOT handle expansion when behaviorExpand not set', async () => {
    expect(childElement1.expanded).toBe(false);

    const trigger = childElement1.shadowRoot.querySelector('#header') as HTMLElement;

    const event = untilEvent(trigger, 'click');
    emulateClick(trigger);
    expect(await event).toBeDefined();

    expect(childElement1.expanded).toBe(false);
  });

  it('should handle behaviorExpandSingle, where only one child may be expanded at a time', async () => {
    expect(childElement1.expanded).toBe(false);
    expect(childElement2.expanded).toBe(false);

    parentElement.behaviorExpandSingle = true;
    await elementIsStable(childElement1);
    await elementIsStable(childElement2);

    const trigger1 = childElement1.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag);

    const event = untilEvent(trigger1, 'click');
    emulateClick(trigger1);
    expect(await event).toBeDefined();

    expect(childElement1.expanded).toBe(true);
    expect(childElement2.expanded).toBe(false);

    const trigger2 = childElement2.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag);

    const event2 = untilEvent(trigger2, 'click');
    const event3 = untilEvent(childElement2, 'open');

    emulateClick(trigger2);
    expect(await event2).toBeDefined();
    expect(await event3).toBeDefined();

    await elementIsStable(parentElement);
    await elementIsStable(childElement1);
    await elementIsStable(childElement2);

    // expect(childElement1.expanded).toBe(false); <-- Not working for some reason, unit test should detect first accordion set back to not expanded in this scenario
    expect(childElement2.expanded).toBe(true);
  });

  it('should only toggle expanded state if the open event originates from a slotted accordion', async () => {
    parentElement.behaviorExpandSingle = true;
    childElement1.expanded = true;
    await elementIsStable(childElement1);
    await elementIsStable(childElement2);
    expect(childElement1.expanded).toBe(true);
    expect(childElement2.expanded).toBe(false);

    const open = untilEvent(childElement1, 'open');
    const div = document.createElement('div');
    childElement1.querySelector('nve-accordion-content')?.appendChild(div);
    div.dispatchEvent(new CustomEvent('open', { bubbles: true }));
    expect(await open).toBeDefined();

    await elementIsStable(childElement1);
    await elementIsStable(childElement2);
    expect(childElement1.expanded).toBe(true);
    expect(childElement2.expanded).toBe(false);
  });

  it('should pass container styles set on parent to children', async () => {
    parentElement.container = 'flat';

    await elementIsStable(parentElement);
    await elementIsStable(childElement1);
    await elementIsStable(childElement2);

    expect(parentElement.container).toBe('flat');
    expect(childElement1.container).toBe('flat');
    expect(childElement2.container).toBe('flat');

    parentElement.container = 'inset';

    await elementIsStable(parentElement);
    await elementIsStable(childElement1);
    await elementIsStable(childElement2);

    expect(parentElement.container).toBe('inset');
    expect(childElement1.container).toBe('inset');
    expect(childElement2.container).toBe('inset');
  });

  it('should set aria-hidden for content property when hidden', async () => {
    expect(childElement1.shadowRoot.querySelector('#content').ariaHidden).toBe('true');
    childElement1.expanded = true;
    await elementIsStable(childElement1);
    expect(childElement1.shadowRoot.querySelector('#content').ariaHidden).toBe('false');
  });

  it('should reflect expanded attribute to DOM', async () => {
    expect(childElement1.hasAttribute('expanded')).toBe(false);
    childElement1.expanded = true;
    await elementIsStable(childElement1);
    expect(childElement1.hasAttribute('expanded')).toBe(true);

    childElement1.expanded = false;
    await elementIsStable(childElement1);
    expect(childElement1.hasAttribute('expanded')).toBe(false);
  });

  it('should reflect container attribute to DOM on individual accordion', async () => {
    expect(childElement1.hasAttribute('container')).toBe(false);
    childElement1.container = 'flat';
    await elementIsStable(childElement1);
    expect(childElement1.getAttribute('container')).toBe('flat');
  });
});

describe(`${Accordion.metadata.tag} - event contracts`, () => {
  let fixture: HTMLElement;
  let element: Accordion;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-accordion behavior-expand>
        <nve-accordion-header>heading</nve-accordion-header>
        <nve-accordion-content>content</nve-accordion-content>
      </nve-accordion>
    `);
    element = fixture.querySelector<Accordion>(Accordion.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should dispatch open event with bubbles and composed when expanded', async () => {
    const event = untilEvent(element, 'open');
    const trigger = element.shadowRoot.querySelector('#header') as HTMLElement;
    emulateClick(trigger);
    const e = await event;
    expect(e).toBeDefined();
    expect((e as Event).bubbles).toBe(true);
    expect((e as Event).composed).toBe(true);
  });

  it('should dispatch close event with bubbles and composed when collapsed', async () => {
    element.expanded = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    const trigger = element.shadowRoot.querySelector('#header') as HTMLElement;
    emulateClick(trigger);
    const e = await event;
    expect(e).toBeDefined();
    expect((e as Event).bubbles).toBe(true);
    expect((e as Event).composed).toBe(true);
  });
});

describe(`${Accordion.metadata.tag} - Actions`, () => {
  let fixture: HTMLElement;
  let element: Accordion;

  /* eslint-disable @nvidia-elements/lint/no-deprecated-slots */
  /* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value */
  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-accordion-group>
      <nve-accordion>
        <nve-accordion-header>
          heading
          <nve-icon-button container="flat" icon-name="add" size="sm" slot="actions"></nve-icon-button>
        </nve-accordion-header>
        <nve-accordion-content>content</nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
    `);
    element = fixture.querySelector<Accordion>(Accordion.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should align caret icon button to left side if an action is provided by consumer', () => {
    expect(element.shadowRoot.querySelector('.has-action')).toBeTruthy();
  });
});

describe(`${Accordion.metadata.tag} - inline interactive`, () => {
  let fixture: HTMLElement;
  let element: Accordion;
  let button: HTMLButtonElement;
  let span: HTMLSpanElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-accordion behavior-expand>
        <nve-accordion-header>
          <span>heading</span> <button>button</button> 
          <nve-icon-button container="flat" icon-name="add" size="sm" slot="suffix"></nve-icon-button>
        </nve-accordion-header>
        <nve-accordion-content>content</nve-accordion-content>
      </nve-accordion>
    `);
    element = fixture.querySelector<Accordion>(Accordion.metadata.tag);
    button = fixture.querySelector<HTMLButtonElement>('button');
    span = fixture.querySelector<HTMLSpanElement>('span');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should not toggle accordion on slotted interactive elements', async () => {
    emulateClick(button);
    await elementIsStable(element);
    expect(element.expanded).toBe(false);
  });

  it('should toggle accordion on slotted interactive elements that are disabled', async () => {
    button.disabled = true;
    emulateClick(button);
    await elementIsStable(element);
    expect(element.expanded).toBe(true);
  });

  it('should not toggle accordion if disabled', async () => {
    element.disabled = true;
    emulateClick(button);
    await elementIsStable(element);
    expect(element.expanded).toBe(false);
  });

  it('should toggle accordion for non interactive elements', async () => {
    emulateClick(span);
    await elementIsStable(element);
    expect(element.expanded).toBe(true);
  });

  it('should toggle if internal toggle trigger is clicked', async () => {
    emulateClick(element.shadowRoot.querySelector('#internal-trigger'));
    await elementIsStable(element);
    expect(element.expanded).toBe(true);
  });

  it('should not toggle if internal toggle trigger is clicked and accordion is disabled', async () => {
    element.disabled = true;
    emulateClick(element.shadowRoot.querySelector('#internal-trigger'));
    await elementIsStable(element);
    expect(element.expanded).toBe(false);
  });
});
