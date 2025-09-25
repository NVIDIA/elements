import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Badge } from '@nvidia-elements/core/badge';
import '@nvidia-elements/core/badge/define.js';

describe(Badge.metadata.tag, () => {
  it('should pass axe check for status', async () => {
    const fixture = await createFixture(html`
      <nve-badge status="scheduled">scheduled</nve-badge>
      <nve-badge status="queued">queued</nve-badge>
      <nve-badge status="pending">pending</nve-badge>
      <nve-badge status="starting">starting</nve-badge>
      <nve-badge status="running">running</nve-badge>
      <nve-badge status="restarting">restarting</nve-badge>
      <nve-badge status="stopping">stopping</nve-badge>
      <nve-badge status="finished">finished</nve-badge>
      <nve-badge status="failed">failed</nve-badge>
      <nve-badge status="unknown">unknown</nve-badge>
      <nve-badge status="ignored">ignored</nve-badge>
    `);

    await elementIsStable(fixture.querySelector(Badge.metadata.tag));
    const results = await runAxe([Badge.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });

  it('should pass axe check for color', async () => {
    const fixture = await createFixture(html`
      <nve-badge color="red-cardinal">red-cardinal</nve-badge>
      <nve-badge color="gray-slate">gray-slate</nve-badge>
      <nve-badge color="gray-denim">gray-denim</nve-badge>
      <nve-badge color="blue-indigo">blue-indigo</nve-badge>
      <nve-badge color="blue-cobalt">blue-cobalt</nve-badge>
      <nve-badge color="blue-sky">blue-sky</nve-badge>
      <nve-badge color="teal-cyan">teal-cyan</nve-badge>
      <nve-badge color="green-mint">green-mint</nve-badge>
      <nve-badge color="teal-seafoam">teal-seafoam</nve-badge>
      <nve-badge color="green-grass">green-grass</nve-badge>
      <nve-badge color="yellow-amber">yellow-amber</nve-badge>
      <nve-badge color="orange-pumpkin">orange-pumpkin</nve-badge>
      <nve-badge color="red-tomato">red-tomato</nve-badge>
      <nve-badge color="pink-magenta">pink-magenta</nve-badge>
      <nve-badge color="purple-plum">purple-plum</nve-badge>
      <nve-badge color="purple-violet">purple-violet</nve-badge>
      <nve-badge color="purple-lavender">purple-lavender</nve-badge>
      <nve-badge color="pink-rose">pink-rose</nve-badge>
      <nve-badge color="green-jade">green-jade</nve-badge>
      <nve-badge color="lime-pear">lime-pear</nve-badge>
      <nve-badge color="yellow-nova">yellow-nova</nve-badge>
      <nve-badge color="brand-green">brand-green</nve-badge>
    `);

    await elementIsStable(fixture.querySelector(Badge.metadata.tag));
    const results = await runAxe([Badge.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
