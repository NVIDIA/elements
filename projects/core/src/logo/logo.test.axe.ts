import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Logo } from '@nvidia-elements/core/logo';
import '@nvidia-elements/core/logo/define.js';

describe(Logo.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Logo;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-logo aria-label="logo"></nve-logo>
    `);
    element = fixture.querySelector(Logo.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Logo.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
