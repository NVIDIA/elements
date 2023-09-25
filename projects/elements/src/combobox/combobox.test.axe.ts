import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Combobox } from '@elements/elements/combobox';
import '@elements/elements/combobox/define.js';

describe('mlv-combobox axe', () => {
  let fixture: HTMLElement;
  let element: Combobox;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
        <mlv-control-message>message</mlv-control-message>
      </mlv-combobox>
    `);
    element = fixture.querySelector('mlv-combobox');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-combobox']);
    expect(results.violations.length).toBe(0);
  });
});
