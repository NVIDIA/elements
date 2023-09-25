import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Month } from '@elements/elements/month';
import '@elements/elements/month/define.js';

describe('nve-month axe', () => {
  let fixture: HTMLElement;
  let element: Month;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-month>
        <label>label</label>
        <input type="month" />
      </nve-month>
    `);
    element = fixture.querySelector('nve-month');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-month']);
    expect(results.violations.length).toBe(0);
  });
});
