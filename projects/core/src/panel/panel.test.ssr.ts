import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Panel } from '@nvidia-elements/core/panel';
import '@nvidia-elements/core/panel/define.js';

describe(Panel.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-panel expanded>
        <nve-panel-header>
          <div slot="title">title</div>
          <div slot="subtitle">subtitle</div>
        </nve-panel-header>
        <nve-panel-content>
          <p nve-text="body">content</p>
        </nve-panel-content>
      </nve-panel>  
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-panel')).toBe(true);
  });
});
