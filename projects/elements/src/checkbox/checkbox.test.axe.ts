import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Checkbox } from '@elements/elements/checkbox';
import '@elements/elements/checkbox/define.js';

describe('nve-checkbox axe', () => {
  let fixture: HTMLElement;
  let element: Checkbox;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-checkbox>
        <label>label</label>
        <input type="checkbox" />
      </nve-checkbox>
    `);
    element = fixture.querySelector('nve-checkbox');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-checkbox']);
    expect(results.violations.length).toBe(0);
  });
});
