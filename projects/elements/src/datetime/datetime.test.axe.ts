import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Datetime } from '@elements/elements/datetime';
import '@elements/elements/datetime/define.js';

describe('mlv-datetime axe', () => {
  let fixture: HTMLElement;
  let element: Datetime;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-datetime>
        <label>label</label>
        <input type="datetime" />
      </mlv-datetime>
    `);
    element = fixture.querySelector('mlv-datetime');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-datetime']);
    expect(results.violations.length).toBe(0);
  });
});
