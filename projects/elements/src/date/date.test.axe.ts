import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Date } from '@elements/elements/date';
import '@elements/elements/date/define.js';

describe('nve-date axe', () => {
  let fixture: HTMLElement;
  let element: Date;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-date>
        <label>label</label>
        <input type="date" />
      </nve-date>
    `);
    element = fixture.querySelector('nve-date');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-date']);
    expect(results.violations.length).toBe(0);
  });
});
