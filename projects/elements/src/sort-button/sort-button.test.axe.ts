import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { SortButton } from '@elements/elements/sort-button';
import '@elements/elements/sort-button/define.js';

describe('nve-sort-button axe', () => {
  let fixture: HTMLElement;
  let element: SortButton;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-sort-button aria-label="sort"></nve-sort-button>
    `);
    element = fixture.querySelector('nve-sort-button');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-sort-button']);
    expect(results.violations.length).toBe(0);
  });
});
