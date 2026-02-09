import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { DialogFooter } from '@nvidia-elements/core/dialog';
import '@nvidia-elements/core/dialog/define.js';

describe(DialogFooter.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DialogFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dialog>
        <nve-dialog-footer>hello</nve-dialog-footer>
      </nve-dialog>
    `);
    element = fixture.querySelector(DialogFooter.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(DialogFooter.metadata.tag)).toBeDefined();
  });

  it('should render with the footer default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('footer');
  });
});
