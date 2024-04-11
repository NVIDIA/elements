import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Switch } from '@nvidia-elements/core/switch';
import '@nvidia-elements/core/switch/define.js';

describe('nve-switch', () => {
  let fixture: HTMLElement;
  let element: Switch;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-switch>
        <label>label</label>
        <input type="checkbox" />
      </nve-switch>
    `);
    element = fixture.querySelector('nve-switch');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-switch')).toBeDefined();
  });
});
