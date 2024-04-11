import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Dot } from '@nvidia-elements/core/dot';
import '@nvidia-elements/core/dot/define.js';

describe('mlv-dot axe', () => {
  let fixture: HTMLElement;
  let element: Dot;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-dot aria-label="dot"></mlv-dot>
    `);
    element = fixture.querySelector('mlv-dot');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-dot']);
    expect(results.violations.length).toBe(0);
  });
});
