import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { PageLoader } from '@elements/elements/page-loader';
import '@elements/elements/page-loader/define.js';

describe('nve-page-loader', () => {
  let fixture: HTMLElement;
  let element: PageLoader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-page-loader></nve-page-loader>
    `);
    element = fixture.querySelector('nve-page-loader');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-page-loader')).toBeDefined();
  });

  it('should use default to center position', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('center');
  });
});
