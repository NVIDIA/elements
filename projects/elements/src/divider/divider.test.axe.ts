import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Divider } from '@elements/elements/divider';
import '@elements/elements/divider/define.js';

describe('mlv-divider', () => {
  let fixture: HTMLElement;
  let element: Divider;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-divider></mlv-divider>
    `);
    element = fixture.querySelector('mlv-divider');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-divider']);
    expect(results.violations.length).toBe(0);
  });
});
