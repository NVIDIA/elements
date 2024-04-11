import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Week } from '@nvidia-elements/core/week';
import '@nvidia-elements/core/week/define.js';

describe('mlv-week', () => {
  let fixture: HTMLElement;
  let element: Week;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-week>
        <label>label</label>
        <input type="week" />
      </mlv-week>
    `);
    element = fixture.querySelector('mlv-week');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-week']);
    expect(results.violations.length).toBe(0);
  });
});
