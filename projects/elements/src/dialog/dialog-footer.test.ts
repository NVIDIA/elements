import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DialogFooter } from '@nvidia-elements/core/dialog';
import '@nvidia-elements/core/dialog/define.js';

describe('mlv-dialog-footer', () => {
  let fixture: HTMLElement;
  let element: DialogFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-dialog>
        <mlv-dialog-footer>hello</mlv-dialog-footer>
      </mlv-dialog>
    `);
    element = fixture.querySelector('mlv-dialog-footer');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-dialog-footer')).toBeDefined();
  });

  it('should render with the footer default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('footer');
  });
});
