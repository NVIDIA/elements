import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { SortButton } from '@nvidia-elements/core/sort-button';
import '@nvidia-elements/core/sort-button/define.js';

describe(SortButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: SortButton;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-sort-button aria-label="sort"></nve-sort-button>
    `);
    element = fixture.querySelector(SortButton.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([SortButton.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
