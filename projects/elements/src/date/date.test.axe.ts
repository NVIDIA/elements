import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Date } from '@nvidia-elements/core/date';
import '@nvidia-elements/core/date/define.js';

describe(Date.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Date;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-date>
        <label>label</label>
        <input type="date" />
      </mlv-date>
    `);
    element = fixture.querySelector(Date.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Date.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
