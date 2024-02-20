import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Dropdown } from '@elements/elements/dropdown';
import '@elements/elements/dropdown/define.js';

describe('mlv-dropdown', () => {
  let fixture: HTMLElement;
  let element: Dropdown;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button id="btn">button</button>
      <mlv-dropdown trigger="btn" anchor="btn" closable>hello</mlv-dropdown>
    `);
    element = fixture.querySelector('mlv-dropdown');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-dropdown']);
    expect(results.violations.length).toBe(0);
  });
});
