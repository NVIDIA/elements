import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Time } from '@nvidia-elements/core/time';
import '@nvidia-elements/core/time/define.js';

describe('mlv-time', () => {
  let fixture: HTMLElement;
  let element: Time;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-time>
        <label>label</label>
        <input type="time" />
      </mlv-time>
    `);
    element = fixture.querySelector('mlv-time');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-time']);
    expect(results.violations.length).toBe(0);
  });
});
