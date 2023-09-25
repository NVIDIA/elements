import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { ButtonGroup } from '@elements/elements/button-group';
import '@elements/elements/button-group/define.js';

describe('nve-button-group', () => {
  let fixture: HTMLElement;
  let element: ButtonGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button-group></nve-button-group>
    `);
    element = fixture.querySelector('nve-button-group');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-button-group')).toBeDefined();
  });
});
