import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Switch } from '@elements/elements/switch';
import '@elements/elements/switch/define.js';

describe('mlv-switch', () => {
  let fixture: HTMLElement;
  let element: Switch;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-switch>
        <label>label</label>
        <input type="checkbox" />
      </mlv-switch>
    `);
    element = fixture.querySelector('mlv-switch');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-switch']);
    expect(results.violations.length).toBe(0);
  });
});
