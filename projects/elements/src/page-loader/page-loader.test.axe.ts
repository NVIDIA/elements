import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { PageLoader } from '@nvidia-elements/core/page-loader';
import '@nvidia-elements/core/page-loader/define.js';

describe('mlv-page-loader', () => {
  let fixture: HTMLElement;
  let element: PageLoader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-page-loader aria-label="page-loader"></mlv-page-loader>
    `);
    element = fixture.querySelector('mlv-page-loader');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-page-loader']);
    expect(results.violations.length).toBe(0);
  });
});
