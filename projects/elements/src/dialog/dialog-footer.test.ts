import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DialogFooter } from '@elements/elements/dialog';
import '@elements/elements/dialog/define.js';

describe('nve-dialog-footer', () => {
  let fixture: HTMLElement;
  let element: DialogFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dialog>
        <nve-dialog-footer>hello</nve-dialog-footer>
      </nve-dialog>
    `);
    element = fixture.querySelector('nve-dialog-footer');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-dialog-footer')).toBeDefined();
  });

  it('should render with the footer default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('footer');
  });
});
