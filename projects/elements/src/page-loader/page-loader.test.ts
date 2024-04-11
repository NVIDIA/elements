import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { PageLoader } from '@nvidia-elements/core/page-loader';
import '@nvidia-elements/core/page-loader/define.js';

describe('mlv-page-loader', () => {
  let fixture: HTMLElement;
  let element: PageLoader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-page-loader></mlv-page-loader>
    `);
    element = fixture.querySelector('mlv-page-loader');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-page-loader')).toBeDefined();
  });

  it('should use default to center position', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('center');
  });
});
