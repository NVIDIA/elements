import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Password } from '@nvidia-elements/core/password';
import '@nvidia-elements/core/password/define.js';

describe(Password.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Password;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-password>
        <label>label</label>
        <input type="password" />
      </mlv-password>
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
