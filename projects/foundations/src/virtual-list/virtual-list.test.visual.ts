// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, test } from 'vitest';
import { visualRunner, ssrRunner } from '@internals/vite';
import '@nvidia-elements/foundations/virtual-list/define.js';

describe('virtual list visual', () => {
  test.each(['', 'dark'])('matches theme %s', async theme => {
    const report = await visualRunner.render(
      `virtual-list${theme ? '.dark' : ''}`,
      `
      <nve-virtual-list item-count="10000" item-height="40" style="--scroll-height:200px"></nve-virtual-list>
      <script type="module">
        import '@nvidia-elements/foundations/virtual-list/define.js';
        document.documentElement.setAttribute('nve-theme', '${theme}');
        const list = document.querySelector('nve-virtual-list');
        function draw() {
          const request = list.range;
          list.replaceChildren(...Array.from({length: request.end - request.start}, () => {
            const row = document.createElement('div');
            row.style.height = '40px'; row.textContent = '••• ••• •••';
            return row;
          }));
          document.body.dataset.ready = 'true';
        }
        list.addEventListener('virtual-change', draw);
        await list.updateComplete;
        if (list.range) draw();
      </script>`,
      { waitFor: waitFor => waitFor(() => document.body.dataset.ready === 'true') }
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
  test('hydrates the server slot and items without replacing them', async () => {
    const markup = await ssrRunner.render(
      html`<nve-virtual-list item-count="1" item-height="40" style="--scroll-height:120px"><div style="height:40px">••• ••• •••</div></nve-virtual-list>`
    );
    await visualRunner.inspect(
      'virtual-list.hydration',
      `${markup}
      <script>
        const list = document.querySelector('nve-virtual-list');
        window.serverSlot = list.shadowRoot.querySelector('slot');
        window.serverItem = list.firstElementChild;
      </script>
      <script type="module">
        import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
        import '@nvidia-elements/foundations/virtual-list/define.js';
        const list = document.querySelector('nve-virtual-list');
        await list.updateComplete;
        document.body.dataset.ready = 'true';
      </script>`,
      async page => {
        await page.waitForFunction(() => document.body.dataset.ready === 'true');
        expect(
          await page.evaluate(() => {
            const list = document.querySelector('nve-virtual-list')!;
            return (
              list.shadowRoot!.querySelector('slot') === Reflect.get(window, 'serverSlot') &&
              list.firstElementChild === Reflect.get(window, 'serverItem')
            );
          })
        ).toBe(true);
        expect(await page.locator('nve-virtual-list .content').isVisible()).toBe(true);
      }
    );
  });
});
