import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@nve-internals/vite';
import { StarRating } from '@nvidia-elements/core/star-rating';
import '@nvidia-elements/core/star-rating/define.js';

describe(StarRating.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
    <nve-star-rating>
        <label>label</label>
        <input type="range"/>
        <nve-control-message>message</nve-control-message>
    </nve-star-rating>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-star-rating')).toBe(true);
  });
});
