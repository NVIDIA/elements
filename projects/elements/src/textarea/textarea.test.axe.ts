import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Textarea } from '@elements/elements/textarea';
import '@elements/elements/textarea/define.js';

describe('nve-textarea axe', () => {
  let fixture: HTMLElement;
  let element: Textarea;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-textarea>
        <label>label</label>
        <textarea></textarea>
      </nve-textarea>
    `);
    element = fixture.querySelector('nve-textarea');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-textarea']);
    expect(results.violations.length).toBe(0);
  });
});
