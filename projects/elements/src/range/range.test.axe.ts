import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Range } from '@elements/elements/range';
import '@elements/elements/range/define.js';

describe('mlv-range', () => {
  let fixture: HTMLElement;
  let element: Range;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-range>
        <label>label</label>
        <input type="range" value="50" />
      </mlv-range>
    `);
    element = fixture.querySelector('mlv-range');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-range']);
    expect(results.violations.length).toBe(0);
  });
});
