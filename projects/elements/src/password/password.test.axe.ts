import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Password } from '@elements/elements/password';
import '@elements/elements/password/define.js';

describe('mlv-password', () => {
  let fixture: HTMLElement;
  let element: Password;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-password>
        <label>label</label>
        <input type="password" />
      </mlv-password>
    `);
    element = fixture.querySelector('mlv-password');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-password']);
    expect(results.violations.length).toBe(0);
  });
});
