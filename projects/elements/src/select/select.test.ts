import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Select } from '@elements/elements/select';
import '@elements/elements/select/define.js';

describe('nve-select', () => {
  let fixture: HTMLElement;
  let element: Select;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-select>
        <label>label</label>
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </nve-select>
    `);
    element = fixture.querySelector('nve-select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-select')).toBeDefined();
  });

  it('should show icon if not a multiple select type', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBeDefined();
    fixture.querySelector('select').multiple = true;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
  });

  it('should show icon if not a size select type', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBeDefined();
    fixture.querySelector('select').size = 3;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
  });
});
