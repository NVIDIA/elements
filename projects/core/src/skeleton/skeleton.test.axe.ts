import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Skeleton } from '@nvidia-elements/core/skeleton';
import '@nvidia-elements/core/skeleton/define.js';

describe(Skeleton.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Skeleton;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-skeleton></nve-skeleton>
    `);
    element = fixture.querySelector(Skeleton.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Skeleton.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });

  it('should pass axe check with effects', async () => {
    const fixtureWithEffects = await createFixture(html`
      <nve-skeleton effect="pulse"></nve-skeleton>
      <nve-skeleton effect="shimmer"></nve-skeleton>
    `);

    await elementIsStable(fixtureWithEffects.querySelector(Skeleton.metadata.tag));
    const results = await runAxe([Skeleton.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixtureWithEffects);
  });

  it('should pass axe check with shapes', async () => {
    const fixtureWithShapes = await createFixture(html`
      <nve-skeleton shape="round"></nve-skeleton>
      <nve-skeleton shape="pill"></nve-skeleton>
    `);

    await elementIsStable(fixtureWithShapes.querySelector(Skeleton.metadata.tag));
    const results = await runAxe([Skeleton.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixtureWithShapes);
  });

  it('should pass axe check with slotted content', async () => {
    const fixtureWithContent = await createFixture(html`
      <nve-skeleton>Loading content...</nve-skeleton>
      <nve-skeleton>
        <div>Loading nested content</div>
      </nve-skeleton>
    `);

    await elementIsStable(fixtureWithContent.querySelector(Skeleton.metadata.tag));
    const results = await runAxe([Skeleton.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixtureWithContent);
  });

  it('should pass axe check with combined variants', async () => {
    const fixtureWithCombined = await createFixture(html`
      <nve-skeleton effect="shimmer" shape="pill"></nve-skeleton>
      <nve-skeleton effect="pulse" shape="round"></nve-skeleton>
      <nve-skeleton effect="shimmer" shape="round">Content</nve-skeleton>
    `);

    await elementIsStable(fixtureWithCombined.querySelector(Skeleton.metadata.tag));
    const results = await runAxe([Skeleton.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixtureWithCombined);
  });
});
