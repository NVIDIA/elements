import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Toggletip } from '@nvidia-elements/core/toggletip';
import '@nvidia-elements/core/toggletip/define.js';

describe(Toggletip.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Toggletip;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button id="btn">button</button>
      <nve-toggletip trigger="btn" anchor="btn" closable>hello</nve-toggletip>
    `);
    element = fixture.querySelector(Toggletip.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Toggletip.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
