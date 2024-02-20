import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Input } from '@elements/elements/input';
import '@elements/elements/input/define.js';

describe('mlv-input axe', () => {
  let fixture: HTMLElement;
  let element: Input;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-input>
        <label>label</label>
        <input type="text" />
      </mlv-input>
    `);
    element = fixture.querySelector('mlv-input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-input']);
    expect(results.violations.length).toBe(0);
  });
});
