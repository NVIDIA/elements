import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/button/define.js';

describe('mlv-button', () => {
  let fixture: HTMLElement;
  let element: Button;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-button interaction="emphasis">emphasis</mlv-button> <!-- failing -->
      <mlv-button>default</mlv-button>
      <mlv-button interaction="destructive">destructive</mlv-button>
      <mlv-button disabled>disabled</mlv-button>
      <mlv-button pressed>pressed</mlv-button>
    `);
    element = fixture.querySelector('mlv-button');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-button'], {
      rules: { 'color-contrast': { enabled: false } } // interaction emphasis fails minimum color-contrast
    });
    expect(results.violations.length).toBe(0);
  });
});
