import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Month } from '@nvidia-elements/core/month';
import '@nvidia-elements/core/month/define.js';

describe(Month.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Month;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-month>
        <label>label</label>
        <input type="month" />
      </nve-month>
    `);
    element = fixture.querySelector(Month.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Month.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
