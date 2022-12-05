import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Select } from '@elements/elements/select';
import '@elements/elements/select/define.js';

describe('mlv-select', () => {
  let fixture: HTMLElement;
  let element: Select;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-select>
        <label>label</label>
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </mlv-select>
    `);
    element = fixture.querySelector('mlv-select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-select')).toBeDefined();
  });

  it('should show icon if not a multiple select type', async () => {
    expect(element.shadowRoot.querySelector('mlv-icon-button')).toBeDefined();
    fixture.querySelector('select').multiple = true;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon-button')).toBe(null);
  });
});
