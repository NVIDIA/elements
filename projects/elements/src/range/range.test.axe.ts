import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Range } from '@nvidia-elements/core/range';
import '@nvidia-elements/core/range/define.js';

describe(Range.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Range;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-range>
        <label>label</label>
        <input type="range" value="50" />
      </nve-range>
    `);
    element = fixture.querySelector(Range.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Range.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
