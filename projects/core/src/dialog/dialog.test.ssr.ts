import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Dialog } from '@nvidia-elements/core/dialog';
import '@nvidia-elements/core/dialog/define.js';

describe(Dialog.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <button popovertarget="dialog">button</button>
      <nve-dialog id="dialog" closable modal>
        <nve-dialog-header>
          <h3 nve-text="heading">header</h3>
        </nve-dialog-header>
        <p nve-text="body">content</p>
        <nve-dialog-footer>
          <p nve-text="body">footer</p>
        </nve-dialog-footer>
      </nve-dialog>  
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-dialog')).toBe(true);
  });
});
