import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Alert } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';

describe(Alert.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-alert>default</nve-alert>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-alert')).toBe(true);
  });
});
