import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Badge } from '@nvidia-elements/core/badge';
import '@nvidia-elements/core/badge/define.js';

describe(Badge.metadata.tag, () => {
  it('should pass axe check for status', async () => {
    const fixture = await createFixture(html`
      <mlv-badge status="scheduled">scheduled</mlv-badge>
      <mlv-badge status="queued">queued</mlv-badge>
      <mlv-badge status="pending">pending</mlv-badge>
      <mlv-badge status="starting">starting</mlv-badge>
      <mlv-badge status="running">running</mlv-badge>
      <mlv-badge status="restarting">restarting</mlv-badge>
      <mlv-badge status="stopping">stopping</mlv-badge>
      <mlv-badge status="finished">finished</mlv-badge>
      <mlv-badge status="failed">failed</mlv-badge>
      <mlv-badge status="unknown">unknown</mlv-badge>
      <mlv-badge status="ignored">ignored</mlv-badge>
    `);

    await elementIsStable(fixture.querySelector(Badge.metadata.tag));
    const results = await runAxe([Badge.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });

  it('should pass axe check for trend', async () => {
    const fixture = await createFixture(html`
      <mlv-badge status="trend-neutral">+15%</mlv-badge>
      <mlv-badge status="trend-up">+15%</mlv-badge>
      <mlv-badge status="trend-down">-15%</mlv-badge>
    `);

    await elementIsStable(fixture.querySelector(Badge.metadata.tag));
    const results = await runAxe([Badge.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });

  it('should pass axe check for color', async () => {
    const fixture = await createFixture(html`
      <mlv-badge color="red-cardinal">red-cardinal</mlv-badge>
      <mlv-badge color="gray-slate">gray-slate</mlv-badge>
      <mlv-badge color="gray-denim">gray-denim</mlv-badge>
      <mlv-badge color="blue-indigo">blue-indigo</mlv-badge>
      <mlv-badge color="blue-cobalt">blue-cobalt</mlv-badge>
      <mlv-badge color="blue-sky">blue-sky</mlv-badge>
      <mlv-badge color="teal-cyan">teal-cyan</mlv-badge>
      <mlv-badge color="green-mint">green-mint</mlv-badge>
      <mlv-badge color="teal-seafoam">teal-seafoam</mlv-badge>
      <mlv-badge color="green-grass">green-grass</mlv-badge>
      <mlv-badge color="yellow-amber">yellow-amber</mlv-badge>
      <mlv-badge color="orange-pumpkin">orange-pumpkin</mlv-badge>
      <mlv-badge color="red-tomato">red-tomato</mlv-badge>
      <mlv-badge color="pink-magenta">pink-magenta</mlv-badge>
      <mlv-badge color="purple-plum">purple-plum</mlv-badge>
      <mlv-badge color="purple-violet">purple-violet</mlv-badge>
      <mlv-badge color="purple-lavender">purple-lavender</mlv-badge>
      <mlv-badge color="pink-rose">pink-rose</mlv-badge>
      <mlv-badge color="green-jade">green-jade</mlv-badge>
      <mlv-badge color="lime-pear">lime-pear</mlv-badge>
      <mlv-badge color="yellow-nova">yellow-nova</mlv-badge>
      <mlv-badge color="brand-green">brand-green</mlv-badge>
    `);

    await elementIsStable(fixture.querySelector(Badge.metadata.tag));
    const results = await runAxe([Badge.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
