import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { ButtonGroup } from '@elements/elements/button-group';
import '@elements/elements/button-group/define.js';

describe('mlv-button-group', () => {
  let fixture: HTMLElement;
  let element: ButtonGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-button-group></mlv-button-group>
    `);
    element = fixture.querySelector('mlv-button-group');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-button-group')).toBeDefined();
  });
});
