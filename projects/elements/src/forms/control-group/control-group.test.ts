import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { ControlGroup, ControlMessage } from '@elements/elements/forms';
import '@elements/elements/forms/define.js';

describe('mlv-control-group', () => {
  let fixture: HTMLElement;
  let label: HTMLLabelElement;
  let element: ControlGroup;
  let message: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-control-group>
        <label>group</label>
        <mlv-control-message>message</mlv-control-message>
      </mlv-control-group>
    `);
    element = fixture.querySelector('mlv-control-group');
    message = fixture.querySelector('mlv-control-message');
    label = fixture.querySelector('label');
    await elementIsStable(element);
    await elementIsStable(message);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-control-group')).toBeDefined();
  });

  it('should provide a aria role of group to describe content', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('group');
  });

  it('should associate label to group', async() => {
    await elementIsStable(element);
    expect(element.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('should assign label to label slot', async() => {
    await elementIsStable(element);
    expect(label.slot).toBe('label');
  });

  it('should associate message to group', async() => {
    await elementIsStable(element);
    expect(element.getAttribute('aria-describedby')).toBe(message.id);
  });
});
