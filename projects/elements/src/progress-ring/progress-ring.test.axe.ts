import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { ProgressRing } from '@elements/elements/progress-ring';
import '@elements/elements/progress-ring/define.js';


describe('nve-progress-ring axe', () => {
  let fixture: HTMLElement;
  let element: ProgressRing;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progress-ring aria-label="progress"></nve-progress-ring>
    `);
    element = fixture.querySelector('nve-progress-ring');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-progress-ring']);
    expect(results.violations.length).toBe(0);
  });
});
