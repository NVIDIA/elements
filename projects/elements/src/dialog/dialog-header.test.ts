import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DialogHeader } from '@nvidia-elements/core/dialog';
import '@nvidia-elements/core/dialog/define.js';

describe(DialogHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DialogHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-dialog>
        <mlv-dialog-header>hello</mlv-dialog-header>
      </mlv-dialog>
    `);
    element = fixture.querySelector(DialogHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(DialogHeader.metadata.tag)).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
