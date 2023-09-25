import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Tooltip } from '@elements/elements/tooltip';
import '@elements/elements/tooltip/define.js';

describe('nve-tooltip axe', () => {
  let fixture: HTMLElement;
  let element: Tooltip;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button id="btn">button</button>
      <nve-tooltip trigger="btn" anchor="btn">tooltip</nve-tooltip>
    `);
    element = fixture.querySelector('nve-tooltip');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-tooltip']);
    expect(results.violations.length).toBe(0);
  });
});
