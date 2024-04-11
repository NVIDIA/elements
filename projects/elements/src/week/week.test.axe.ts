import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Week } from '@nvidia-elements/core/week';
import '@nvidia-elements/core/week/define.js';

describe('nve-week', () => {
  let fixture: HTMLElement;
  let element: Week;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-week>
        <label>label</label>
        <input type="week" />
      </nve-week>
    `);
    element = fixture.querySelector('nve-week');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-week']);
    expect(results.violations.length).toBe(0);
  });
});
