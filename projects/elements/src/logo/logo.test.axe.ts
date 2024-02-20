import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Logo } from '@elements/elements/logo';
import '@elements/elements/logo/define.js';

describe('mlv-logo', () => {
  let fixture: HTMLElement;
  let element: Logo;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-logo aria-label="logo"></mlv-logo>
    `);
    element = fixture.querySelector('mlv-logo');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-logo']);
    expect(results.violations.length).toBe(0);
  });
});
