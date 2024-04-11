import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Textarea } from '@nvidia-elements/core/textarea';
import '@nvidia-elements/core/textarea/define.js';

describe('mlv-textarea', () => {
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

  it('should define element', () => {
    expect(customElements.get('mlv-textarea')).toBeDefined();
  });
});
