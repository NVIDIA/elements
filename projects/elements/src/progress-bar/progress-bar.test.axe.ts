import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { ProgressBar } from '@elements/elements/progress-bar';
import '@elements/elements/progress-bar/define.js';

describe('mlv-progress-bar axe', () => {
  let fixture: HTMLElement;
  let element: ProgressBar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-progress-bar></mlv-progress-bar>
    `);
    element = fixture.querySelector('mlv-progress-bar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-progress-bar']);
    expect(results.violations.length).toBe(0);
  });
});
