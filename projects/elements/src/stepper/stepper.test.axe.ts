import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { StepperItem, Stepper } from '@nvidia-elements/core/stepper';
import '@nvidia-elements/core/stepper/define.js';

describe('mlv-stepper axe', () => {
  let fixture: HTMLElement;
  let stepper: Stepper;
  let item: StepperItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-stepper>
        <mlv-stepper-item>Step 1</mlv-stepper-item>
        <mlv-stepper-item selected>Step 2</mlv-stepper-item>
        <mlv-stepper-item disabled>Step 3</mlv-stepper-item>
      </mlv-stepper>
    `);
    stepper = fixture.querySelector('mlv-stepper');
    item = fixture.querySelector('mlv-stepper-item');

    await elementIsStable(stepper);
    await elementIsStable(item);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-stepper'], {
      rules: { 'color-contrast': { enabled: false } }
    });
    expect(results.violations.length).toBe(0);
  });
});
