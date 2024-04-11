import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Color } from '@nvidia-elements/core/color';
import '@nvidia-elements/core/color/define.js';

describe('mlv-color axe', () => {
  let fixture: HTMLElement;
  let element: Color;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-color>
        <label>label</label>
        <input type="color" />
      </mlv-color>
    `);
    element = fixture.querySelector('mlv-color');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-color']);
    expect(results.violations.length).toBe(0);
  });
});
