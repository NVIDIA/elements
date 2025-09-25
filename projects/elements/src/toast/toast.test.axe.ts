import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Toast } from '@nvidia-elements/core/toast';
import '@nvidia-elements/core/toast/define.js';

describe(Toast.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Toast;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button popovertarget="toast">button</button>
      <nve-toast id="toast">toast</nve-toast>
    `);
    element = fixture.querySelector(Toast.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Toast.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
