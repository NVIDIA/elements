import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Toast } from '@elements/elements/toast';
import '@elements/elements/toast/define.js';

describe('nve-toast', () => {
  let fixture: HTMLElement;
  let element: Toast;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button id="btn">button</button>
      <nve-toast trigger="btn" anchor="btn">toast</nve-toast>
    `);
    element = fixture.querySelector('nve-toast');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-toast']);
    expect(results.violations.length).toBe(0);
  });
});
