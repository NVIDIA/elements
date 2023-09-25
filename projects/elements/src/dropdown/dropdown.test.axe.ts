import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Dropdown } from '@elements/elements/dropdown';
import '@elements/elements/dropdown/define.js';

describe('nve-dropdown', () => {
  let fixture: HTMLElement;
  let element: Dropdown;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button id="btn">button</button>
      <nve-dropdown trigger="btn" anchor="btn" closable>hello</nve-dropdown>
    `);
    element = fixture.querySelector('nve-dropdown');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-dropdown']);
    expect(results.violations.length).toBe(0);
  });
});
