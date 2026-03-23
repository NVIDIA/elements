import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Password } from '@nvidia-elements/core/password';
import '@nvidia-elements/core/password/define.js';

describe(Password.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-password>
        <label>label</label>
        <input type="password" />
      </nve-password>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-password')).toBe(true);
  });
});
