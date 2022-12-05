import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { InputGroup } from '@elements/elements/input';
import '@elements/elements/input/define.js';

describe('nve-input', () => {
  let fixture: HTMLElement;
  let element: InputGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-input-group>
        <nve-input>
          <label>label</label>
          <input type="text" />
        </nve-input>
        <nve-input>
          <label>label</label>
          <input type="text" />
        </nve-input>
      </nve-input-group>
    `);
    element = fixture.querySelector('nve-input-group');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-input-group')).toBeDefined();
  });

  it('should mark first and last controls in group', async () => {
    const controls = Array.from(fixture.querySelectorAll('[nve-control]'));
    expect(controls[0].hasAttribute('first-control')).toBe(true);
    expect(controls[1].hasAttribute('last-control')).toBe(true);
  });
});
