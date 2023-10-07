import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { PageLoader } from '@elements/elements/page-loader';
import '@elements/elements/page-loader/define.js';

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

  it('should use auto behavior when modal', async () => {
    element.modal = true;
    await elementIsStable(element);
    expect(element.popoverType).toBe('auto');
  });

  it('should use default to center position', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('center');
  });

  it('should not be closable', async () => {
    element.modal = true;
    await elementIsStable(element);
    expect(element.closable).toBe(false);
  });
});
