import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Time } from '@elements/elements/time';
import '@elements/elements/time/define.js';

describe('nve-time', () => {
  let fixture: HTMLElement;
  let element: Time;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-time>
        <label>label</label>
        <input type="time" />
      </nve-time>
    `);
    element = fixture.querySelector('nve-time');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-time']);
    expect(results.violations.length).toBe(0);
  });
});
