import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Tooltip } from '@elements/elements/tooltip';
import '@elements/elements/tooltip/define.js';

describe('mlv-tooltip axe', () => {
  let fixture: HTMLElement;
  let element: Tooltip;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button id="btn">button</button>
      <mlv-tooltip trigger="btn" anchor="btn">tooltip</mlv-tooltip>
    `);
    element = fixture.querySelector('mlv-tooltip');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-tooltip']);
    expect(results.violations.length).toBe(0);
  });
});
