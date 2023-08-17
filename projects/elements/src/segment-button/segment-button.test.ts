import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { SegmentButton } from '@elements/elements/segment-button';
import '@elements/elements/segment-button/define.js';

describe('mlv-segment-button', () => {
  let fixture: HTMLElement;
  let element: SegmentButton;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-segment-button></mlv-segment-button>
    `);
    element = fixture.querySelector('mlv-segment-button');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-segment-button')).toBeDefined();
  });
});
