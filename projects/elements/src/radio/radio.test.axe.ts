import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Radio } from '@nvidia-elements/core/radio';
import '@nvidia-elements/core/radio/define.js';

describe(Radio.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Radio;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-radio>
        <label>label</label>
        <input type="radio" />
      </mlv-radio>
    `);
    element = fixture.querySelector(Radio.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Radio.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
