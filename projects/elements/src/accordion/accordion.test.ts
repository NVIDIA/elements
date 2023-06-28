import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Accordion } from '@elements/elements/accordion';
import '@elements/elements/accordion/define.js';

describe('mlv-accordion', () => {
  let fixture: HTMLElement;
  let element: Accordion;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-accordion></mlv-accordion>
    `);
    element = fixture.querySelector('mlv-accordion');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-accordion')).toBeDefined();
  });
});
