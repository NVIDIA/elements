import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Toast } from '@nvidia-elements/core/toast';
import '@nvidia-elements/core/toast/define.js';

describe('mlv-toast', () => {
  let fixture: HTMLElement;
  let element: Toast;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button id="btn">button</button>
      <mlv-toast trigger="btn" anchor="btn">toast</mlv-toast>
    `);
    element = fixture.querySelector('mlv-toast');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-toast']);
    expect(results.violations.length).toBe(0);
  });
});
