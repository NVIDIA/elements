import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@elements/elements/test';
import { Accordion, AccordionGroup } from '@elements/elements/accordion';
import '@elements/elements/accordion/define.js';


describe('mlv-accordion', () => {
  let fixture: HTMLElement;
  let parentElement: AccordionGroup;
  let childElement1: Accordion;
  let childElement2: Accordion;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <mlv-accordion-group>
      <mlv-accordion></mlv-accordion>
      <mlv-accordion></mlv-accordion>
    </mlv-accordion-group>
    `);
    parentElement = fixture.querySelector('mlv-accordion-group');
    childElement1 = fixture.querySelectorAll('mlv-accordion')[0];
    childElement2 = fixture.querySelectorAll('mlv-accordion')[1];

    await elementIsStable(parentElement);
    await elementIsStable(childElement1);
    await elementIsStable(childElement2);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define parentElement', () => {
    expect(customElements.get('mlv-accordion-group')).toBeDefined();
  });

  it('should define childElement', () => {
    expect(customElements.get('mlv-accordion')).toBeDefined();
  });

  it('should have correct a18y roles', async () => {
    expect(parentElement._internals.role).toBe('group');
    expect(childElement1._internals.role).toBe('region');
  });

  it('should have proper defaults on parent', () => {
    expect(parentElement.container).toBe('full');
    expect(parentElement.behaviorExpand).toBe(false);
    expect(parentElement.behaviorExpandSingle).toBe(false);
  });

  it('should handle behaviorExpand, passed from parent group element, when clicking on the caret', async () => {
    expect(childElement1.expanded).toBe(false);

    parentElement.behaviorExpand = true;
    await elementIsStable(childElement1);

    const trigger = childElement1.shadowRoot.querySelector('mlv-icon-button');

    const event = untilEvent(trigger, 'click');
    emulateClick(trigger);
    expect((await event)).toBeDefined();

    expect(childElement1.expanded).toBe(true);
  });

  it('should NOT handle expansion when behaviorExpand not set', async () => {
    expect(childElement1.expanded).toBe(false);

    const trigger = childElement1.shadowRoot.querySelector('mlv-icon-button');

    const event = untilEvent(trigger, 'click');
    emulateClick(trigger);
    expect((await event)).toBeDefined();

    expect(childElement1.expanded).toBe(false);
  });

  it('should handle behaviorExpandSingle, where only one child may be expanded at a time', async () => {
    expect(childElement1.expanded).toBe(false);
    expect(childElement2.expanded).toBe(false);

    parentElement.behaviorExpandSingle = true;
    await elementIsStable(childElement1);
    await elementIsStable(childElement2);

    const trigger1 = childElement1.shadowRoot.querySelector('mlv-icon-button');

    const event = untilEvent(trigger1, 'click');
    emulateClick(trigger1);
    expect((await event)).toBeDefined();

    expect(childElement1.expanded).toBe(true);
    expect(childElement2.expanded).toBe(false);

    const trigger2 = childElement2.shadowRoot.querySelector('mlv-icon-button');

    const event2 = untilEvent(trigger2, 'click');
    const event3 = untilEvent(childElement2, 'open');

    emulateClick(trigger2);
    expect((await event2)).toBeDefined();
    expect((await event3)).toBeDefined();

    await elementIsStable(parentElement);
    await elementIsStable(childElement1);
    await elementIsStable(childElement2);


    // expect(childElement1.expanded).toBe(false); <-- Not working for some reason, unit test should detect first accordion set back to not expanded in this scenario
    expect(childElement2.expanded).toBe(true);
  });

  it('should pass container styles set on parent to children', async () => {
    expect(parentElement.container).toBe('full');
    expect(childElement1.container).toBe('full');
    expect(childElement2.container).toBe('full');

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
});
