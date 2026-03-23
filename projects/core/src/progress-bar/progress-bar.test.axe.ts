import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ProgressBar } from '@nvidia-elements/core/progress-bar';
import '@nvidia-elements/core/progress-bar/define.js';

describe(ProgressBar.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ProgressBar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progress-bar></nve-progress-bar>
    `);
    element = fixture.querySelector(ProgressBar.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([ProgressBar.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
