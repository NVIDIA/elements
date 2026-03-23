import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Tooltip } from '@nvidia-elements/core/tooltip';
import '@nvidia-elements/core/tooltip/define.js';

describe(Tooltip.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Tooltip;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button popovertarget="tooltip">button</button>
      <nve-tooltip id="tooltip" closable>hello</nve-tooltip>
    `);
    element = fixture.querySelector(Tooltip.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Tooltip.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
