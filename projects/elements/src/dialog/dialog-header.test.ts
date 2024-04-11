import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DialogHeader } from '@nvidia-elements/core/dialog';
import '@nvidia-elements/core/dialog/define.js';

describe('nve-dialog-header', () => {
  let fixture: HTMLElement;
  let element: DialogHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dialog>
        <nve-dialog-header>hello</nve-dialog-header>
      </nve-dialog>
    `);
    element = fixture.querySelector('nve-dialog-header');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-dialog-header')).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
