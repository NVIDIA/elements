import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { ProgressBar } from '@nvidia-elements/core/progress-bar';
import '@nvidia-elements/core/progress-bar/define.js';

describe('nve-progress-bar axe', () => {
  let fixture: HTMLElement;
  let element: ProgressBar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progress-bar></nve-progress-bar>
    `);
    element = fixture.querySelector('nve-progress-bar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-progress-bar']);
    expect(results.violations.length).toBe(0);
  });
});
