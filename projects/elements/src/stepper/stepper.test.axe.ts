import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { StepperItem, Stepper } from '@nvidia-elements/core/stepper';
import '@nvidia-elements/core/stepper/define.js';

describe('nve-stepper axe', () => {
  let fixture: HTMLElement;
  let stepper: Stepper;
  let item: StepperItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-stepper>
        <nve-stepper-item>Step 1</nve-stepper-item>
        <nve-stepper-item selected>Step 2</nve-stepper-item>
        <nve-stepper-item disabled>Step 3</nve-stepper-item>
      </nve-stepper>
    `);
    stepper = fixture.querySelector('nve-stepper');
    item = fixture.querySelector('nve-stepper-item');

    await elementIsStable(stepper);
    await elementIsStable(item);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-stepper'], {
      rules: { 'color-contrast': { enabled: false } }
    });
    expect(results.violations.length).toBe(0);
  });
});
