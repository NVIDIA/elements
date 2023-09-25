import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Logo } from '@elements/elements/logo';
import '@elements/elements/logo/define.js';

describe('nve-logo', () => {
  let fixture: HTMLElement;
  let element: Logo;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-logo aria-label="logo"></nve-logo>
    `);
    element = fixture.querySelector('nve-logo');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-logo']);
    expect(results.violations.length).toBe(0);
  });
});
