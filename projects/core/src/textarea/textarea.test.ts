import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { Textarea } from '@nvidia-elements/core/textarea';
import '@nvidia-elements/core/textarea/define.js';

describe(Textarea.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Textarea;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-textarea>
        <label>label</label>
        <textarea></textarea>
      </nve-textarea>
    `);
    element = fixture.querySelector(Textarea.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Textarea.metadata.tag)).toBeDefined();
  });

  it('should find the slotted textarea as its input', async () => {
    await elementIsStable(element);
    const textarea = fixture.querySelector('textarea');
    expect(element.input).toBe(textarea);
  });
});
