import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { SortButton } from '@elements/elements/sort-button';
import '@elements/elements/sort-button/define.js';

describe('mlv-sort-button axe', () => {
  let fixture: HTMLElement;
  let element: SortButton;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-sort-button aria-label="sort"></mlv-sort-button>
    `);
    element = fixture.querySelector('mlv-sort-button');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-sort-button']);
    expect(results.violations.length).toBe(0);
  });
});
