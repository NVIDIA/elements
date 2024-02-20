import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { ProgressiveFilterChip } from '@elements/elements/progressive-filter-chip';
import '@elements/elements/progressive-filter-chip/define.js';
import '@elements/elements/forms/define.js';

describe('mlv-progressive-filter-chip axe', () => {
  let fixture: HTMLElement;
  let element: ProgressiveFilterChip;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-progressive-filter-chip>
        <select aria-label="select">
          <option value="1">option 1</option>
          <option value="2">option 2</option>
        </select>
        <input type="text" value="text value" aria-label="text input" />
        <input type="date" value="2021-01-01" aria-label="date input" />
      </mlv-progressive-filter-chip>
    `);
    element = fixture.querySelector('mlv-progressive-filter-chip');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-progressive-filter-chip']);
    expect(results.violations.length).toBe(0);
  });
});
