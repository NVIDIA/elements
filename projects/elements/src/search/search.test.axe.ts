import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Search } from '@nvidia-elements/core/search';
import '@nvidia-elements/core/search/define.js';

describe('nve-search axe', () => {
  let fixture: HTMLElement;
  let element: Search;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-search>
        <label>label</label>
        <input type="search" />
      </nve-search>
    `);
    element = fixture.querySelector('nve-search');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-search']);
    expect(results.violations.length).toBe(0);
  });
});
