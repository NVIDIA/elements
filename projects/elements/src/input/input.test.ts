import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Input } from '@nvidia-elements/core/input';
import '@nvidia-elements/core/input/define.js';

describe('nve-input', () => {
  let fixture: HTMLElement;
  let element: Input;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-input>
        <label>label</label>
        <input type="text" />
      </nve-input>
    `);
    element = fixture.querySelector('nve-input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-input')).toBeDefined();
  });
});
