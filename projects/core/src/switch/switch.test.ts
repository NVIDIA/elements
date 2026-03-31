import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { Switch } from '@nvidia-elements/core/switch';
import '@nvidia-elements/core/switch/define.js';

describe(Switch.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Switch;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-switch>
        <label>label</label>
        <input type="checkbox" />
      </nve-switch>
    `);
    element = fixture.querySelector(Switch.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Switch.metadata.tag)).toBeDefined();
  });

  it('should set nve-control attribute to inline', () => {
    expect(element.getAttribute('nve-control')).toBe('inline');
  });

  it('should add :state(checked) when input is checked', async () => {
    const input = fixture.querySelector('input');
    expect(element.matches(':state(checked)')).toBe(false);

    input.click();
    await elementIsStable(element);
    expect(element.matches(':state(checked)')).toBe(true);
  });

  it('should remove :state(checked) when input is unchecked', async () => {
    const input = fixture.querySelector('input');
    input.click();
    await elementIsStable(element);
    expect(element.matches(':state(checked)')).toBe(true);

    input.click();
    await elementIsStable(element);
    expect(element.matches(':state(checked)')).toBe(false);
  });

  it('should add :state(disabled) when input is disabled', async () => {
    const input = fixture.querySelector('input');
    expect(element.matches(':state(disabled)')).toBe(false);

    input.disabled = true;
    await elementIsStable(element);
    expect(element.matches(':state(disabled)')).toBe(true);
  });
});
