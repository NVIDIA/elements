import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Search } from '@elements/elements/search';
import '@elements/elements/search/define.js';

describe('mlv-search axe', () => {
  let fixture: HTMLElement;
  let element: Search;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-search>
        <label>label</label>
        <input type="search" />
      </mlv-search>
    `);
    element = fixture.querySelector('mlv-search');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-search']);
    expect(results.violations.length).toBe(0);
  });
});
