import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { PageHeader } from '@nvidia-elements/core/page-header';
import '@nvidia-elements/core/page-header/define.js';

describe(PageHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: PageHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-page-header></nve-page-header>
    `);
    element = fixture.querySelector(PageHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([PageHeader.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
