import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Datetime } from '@nvidia-elements/core/datetime';
import '@nvidia-elements/core/datetime/define.js';

describe(Datetime.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Datetime;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-datetime>
        <label>label</label>
        <input type="datetime-local" />
      </nve-datetime>
    `);
    element = fixture.querySelector(Datetime.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Datetime.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
