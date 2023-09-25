import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Select } from '@elements/elements/select';
import '@elements/elements/select/define.js';

describe('mlv-select axe', () => {
  let fixture: HTMLElement;
  let element: Select;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-select>
        <label>label</label>
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">
            Option 3
            <template>
              Option 3
              <span>Custom Content</span> 
            </template>
          </option>
        </select>
      </mlv-select>
    `);
    element = fixture.querySelector('mlv-select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-select']);
    expect(results.violations.length).toBe(0);
  });
});
