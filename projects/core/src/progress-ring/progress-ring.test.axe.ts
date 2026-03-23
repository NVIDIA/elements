import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ProgressRing } from '@nvidia-elements/core/progress-ring';
import '@nvidia-elements/core/progress-ring/define.js';

describe(ProgressRing.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ProgressRing;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progress-ring aria-label="progress"></nve-progress-ring>
    `);
    element = fixture.querySelector(ProgressRing.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([ProgressRing.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
