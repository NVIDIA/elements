import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { ProgressBar } from '@elements/elements/progress-bar';
import '@elements/elements/progress-bar/define.js';

describe('mlv-time', () => {
  let fixture: HTMLElement;
  let element: ProgressBar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-progress-bar></mlv-progress-bar>
    `);
    element = fixture.querySelector('mlv-progress-bar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-progress-bar')).toBeDefined();
  });
});
