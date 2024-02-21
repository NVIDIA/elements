import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { InputGroup } from '@elements/elements/input';
import '@elements/elements/input/define.js';

describe('mlv-input', () => {
  let fixture: HTMLElement;
  let element: InputGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-input-group>
        <mlv-input>
          <label>label</label>
          <input type="text" />
        </mlv-input>
        <mlv-input>
          <label>label</label>
          <input type="text" />
        </mlv-input>
      </mlv-input-group>
    `);
    element = fixture.querySelector('mlv-input-group');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-input-group')).toBeDefined();
  });

  it('should mark first and last controls in group', async () => {
    const controls = Array.from(fixture.querySelectorAll('[nve-control]'));
    expect(controls[0].hasAttribute('first-control')).toBe(true);
    expect(controls[1].hasAttribute('last-control')).toBe(true);
  });
});
