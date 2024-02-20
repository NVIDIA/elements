import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Date } from '@elements/elements/date';
import '@elements/elements/date/define.js';

describe('mlv-date axe', () => {
  let fixture: HTMLElement;
  let element: Date;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-date>
        <label>label</label>
        <input type="date" />
      </mlv-date>
    `);
    element = fixture.querySelector('mlv-date');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-date']);
    expect(results.violations.length).toBe(0);
  });
});
