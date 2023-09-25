import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Textarea } from '@elements/elements/textarea';
import '@elements/elements/textarea/define.js';

describe('nve-textarea', () => {
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

  it('should define element', () => {
    expect(customElements.get('nve-textarea')).toBeDefined();
  });
});
