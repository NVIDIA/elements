import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Select } from '@elements/elements/select';
import '@elements/elements/select/define.js';

describe('nve-select axe', () => {
  let fixture: HTMLElement;
  let element: Select;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-select>
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
      </nve-select>
    `);
    element = fixture.querySelector('nve-select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-select']);
    expect(results.violations.length).toBe(0);
  });
});
