import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Sparkline } from '@nvidia-elements/core/sparkline';
import '@nvidia-elements/core/sparkline/define.js';

describe(Sparkline.metadata.tag, () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-sparkline aria-label="line sparkline" mark="line" .data=${[6, 8, 7, 11, 9, 12]}></nve-sparkline>
      <nve-sparkline aria-label="area sparkline" mark="area" .data=${[6, 8, 7, 11, 9, 12]}></nve-sparkline>
      <nve-sparkline aria-label="gradient sparkline" mark="gradient" .data=${[6, 8, 7, 11, 9, 12]}></nve-sparkline>
      <nve-sparkline aria-label="column sparkline" mark="column" .data=${[6, 8, 7, 11, 9, 12]}></nve-sparkline>
      <nve-sparkline aria-label="winloss sparkline" mark="winloss" .data=${[1, 0, -1, 1, -1, 0]}></nve-sparkline>
      <nve-sparkline aria-label="smooth interpolation" mark="gradient" interpolation="smooth" .data=${[6, 8, 7, 11, 9, 12]}></nve-sparkline>
      <nve-sparkline aria-label="step interpolation" mark="gradient" interpolation="step" .data=${[6, 8, 7, 11, 9, 12]}></nve-sparkline>
    `);
    await elementIsStable(fixture.querySelector(Sparkline.metadata.tag));
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('passes axe checks across mark and interpolation variants', async () => {
    const results = await runAxe([Sparkline.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
