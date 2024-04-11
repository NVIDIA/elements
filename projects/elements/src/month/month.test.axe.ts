import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Month } from '@nvidia-elements/core/month';
import '@nvidia-elements/core/month/define.js';

describe('mlv-month axe', () => {
  let fixture: HTMLElement;
  let element: Month;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-month>
        <label>label</label>
        <input type="month" />
      </mlv-month>
    `);
    element = fixture.querySelector('mlv-month');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-month']);
    expect(results.violations.length).toBe(0);
  });
});
