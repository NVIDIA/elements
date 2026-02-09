import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ProgressiveFilterChip } from '@nvidia-elements/core/progressive-filter-chip';
import '@nvidia-elements/core/progressive-filter-chip/define.js';
import '@nvidia-elements/core/forms/define.js';

describe(ProgressiveFilterChip.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ProgressiveFilterChip;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progressive-filter-chip>
        <select aria-label="select">
          <option value="1">option 1</option>
          <option value="2">option 2</option>
        </select>
        <input type="text" value="text value" aria-label="text input" />
        <input type="date" value="2021-01-01" aria-label="date input" />
      </nve-progressive-filter-chip>
    `);
    element = fixture.querySelector(ProgressiveFilterChip.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([ProgressiveFilterChip.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
