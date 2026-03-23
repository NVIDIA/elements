import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Skeleton } from '@nvidia-elements/core/skeleton';
import '@nvidia-elements/core/skeleton/define.js';

describe(Skeleton.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-skeleton></nve-skeleton>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-skeleton')).toBe(true);
  });

  it('should pass ssr check with effects', async () => {
    const result = await ssrRunner.render(html`
      <nve-skeleton effect="pulse"></nve-skeleton>
      <nve-skeleton effect="shimmer"></nve-skeleton>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-skeleton')).toBe(true);
    expect(result.includes('effect="pulse"')).toBe(true);
    expect(result.includes('effect="shimmer"')).toBe(true);
  });

  it('should pass ssr check with shapes', async () => {
    const result = await ssrRunner.render(html`
      <nve-skeleton shape="round"></nve-skeleton>
      <nve-skeleton shape="pill"></nve-skeleton>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-skeleton')).toBe(true);
    expect(result.includes('shape="round"')).toBe(true);
    expect(result.includes('shape="pill"')).toBe(true);
  });

  it('should pass ssr check with slotted content', async () => {
    const result = await ssrRunner.render(html`
      <nve-skeleton>Loading content...</nve-skeleton>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-skeleton')).toBe(true);
    expect(result.includes('Loading content...')).toBe(true);
  });
});
