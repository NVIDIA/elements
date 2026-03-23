import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Alert } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';

describe(Alert.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-alert-group>
        <nve-alert>default</nve-alert>
        <nve-alert>default</nve-alert>
      </nve-alert-group>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-alert-group')).toBe(true);
    expect(result.includes('nve-alert')).toBe(true);
  });
});
