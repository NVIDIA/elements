import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Textarea } from '@nvidia-elements/core/textarea';
import '@nvidia-elements/core/textarea/define.js';

describe('mlv-textarea axe', () => {
  let fixture: HTMLElement;
  let element: Textarea;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-textarea>
        <label>label</label>
        <textarea></textarea>
      </mlv-textarea>
    `);
    element = fixture.querySelector('mlv-textarea');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-textarea']);
    expect(results.violations.length).toBe(0);
  });
});
