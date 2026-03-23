import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Dot } from '@nvidia-elements/core/dot';
import '@nvidia-elements/core/dot/define.js';

describe(Dot.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Dot;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dot aria-label="dot"></nve-dot>
    `);
    element = fixture.querySelector(Dot.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Dot.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
