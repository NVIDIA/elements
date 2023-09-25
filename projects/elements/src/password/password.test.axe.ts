import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Password } from '@elements/elements/password';
import '@elements/elements/password/define.js';

describe('nve-password', () => {
  let fixture: HTMLElement;
  let element: Password;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-password>
        <label>label</label>
        <input type="password" />
      </nve-password>
    `);
    element = fixture.querySelector('nve-password');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-password']);
    expect(results.violations.length).toBe(0);
  });
});
