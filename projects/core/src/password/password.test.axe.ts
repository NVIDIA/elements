import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Password } from '@nvidia-elements/core/password';
import '@nvidia-elements/core/password/define.js';

describe(Password.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Password;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-password>
        <label>label</label>
        <input type="password" />
      </nve-password>
    `);
    element = fixture.querySelector(Password.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Password.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
