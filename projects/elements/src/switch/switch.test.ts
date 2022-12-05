import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Switch } from '@elements/elements/switch';
import '@elements/elements/switch/define.js';

describe('mlv-switch', () => {
  let fixture: HTMLElement;
  let element: Switch;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-switch>
        <label>label</label>
        <input type="checkbox" />
      </mlv-switch>
    `);
    element = fixture.querySelector('mlv-switch');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-switch')).toBeDefined();
  });
});
