import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DialogHeader } from '@elements/elements/dialog';
import '@elements/elements/dialog/define.js';

describe('mlv-dialog-header', () => {
  let fixture: HTMLElement;
  let element: DialogHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-dialog>
        <mlv-dialog-header>hello</mlv-dialog-header>
      </mlv-dialog>
    `);
    element = fixture.querySelector('mlv-dialog-header');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-dialog-header')).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
