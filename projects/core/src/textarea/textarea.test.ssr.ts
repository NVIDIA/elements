import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Textarea } from '@nvidia-elements/core/textarea';
import '@nvidia-elements/core/textarea/define.js';

describe(Textarea.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-textarea>
        <label>label</label>
        <textarea></textarea>
      </nve-textarea>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-textarea')).toBe(true);
  });
});
