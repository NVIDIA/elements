import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Color } from '@elements/elements/color';
import '@elements/elements/color/define.js';

describe('nve-color axe', () => {
  let fixture: HTMLElement;
  let element: Color;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-color>
        <label>label</label>
        <input type="color" />
      </nve-color>
    `);
    element = fixture.querySelector('nve-color');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-color']);
    expect(results.violations.length).toBe(0);
  });
});
