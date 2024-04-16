import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { StepsItem, Steps } from '@nvidia-elements/core/steps';
import '@nvidia-elements/core/steps/define.js';

describe('nve-steps axe', () => {
  let fixture: HTMLElement;
  let steps: Steps;
  let item: StepsItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-steps>
        <nve-steps-item>Step 1</nve-steps-item>
        <nve-steps-item selected>Step 2</nve-steps-item>
        <nve-steps-item disabled>Step 3</nve-steps-item>
      </nve-steps>
    `);
    steps = fixture.querySelector('nve-steps');
    item = fixture.querySelector('nve-steps-item');

    await elementIsStable(steps);
    await elementIsStable(item);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-steps'], {
      rules: { 'color-contrast': { enabled: false } }
    });
    expect(results.violations.length).toBe(0);
  });
});
