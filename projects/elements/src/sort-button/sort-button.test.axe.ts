import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { SortButton } from '@nvidia-elements/core/sort-button';
import '@nvidia-elements/core/sort-button/define.js';

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
