// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, test } from 'vitest';
import { visualRunner, ssrRunner } from '@internals/vite';
import '@nvidia-elements/foundations/draggable-list/define.js';

describe('draggable list visual', () => {
  test.each(['', 'dark'])('shows insertion markers in theme %s', async theme => {
    const report = await visualRunner.render(
      `draggable-list${theme ? '.dark' : ''}`,
      `
      <div style="display:flex;flex-direction:column;gap:12px;width:300px">
        <nve-draggable-list><button nve-draggable="active">••• •••</button><button nve-draggable="before target">••• •••</button><button nve-draggable="after target">••• •••</button><button nve-draggable="dropzone append target">••• •••</button></nve-draggable-list>
        <nve-draggable-list nve-draggable="dropzone append target" style="min-height:40px"></nve-draggable-list>
      </div>
      <div dir="rtl" style="display:flex;gap:12px;margin-top:24px">
        <nve-draggable-list orientation="horizontal"><button nve-draggable="before target">••• •••</button><button nve-draggable="after target">••• •••</button></nve-draggable-list>
        <nve-draggable-list orientation="horizontal" nve-draggable="dropzone append target" style="width:80px;min-height:24px"></nve-draggable-list>
      </div>
      <script type="module">
        import '@nvidia-elements/foundations/draggable-list/define.js';
        document.documentElement.setAttribute('nve-theme', '${theme}');
      </script>`
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('supports real native dragging and keyboard activation after hydration', async () => {
    const markup = await ssrRunner.render(
      html`<nve-draggable-list><button>•</button><button>••</button><button>•••</button></nve-draggable-list>`
    );
    await visualRunner.inspect(
      'draggable-list.interactions',
      `${markup}
      <style>nve-draggable-list{--gap:16px;width:200px}button{height:40px}</style>
      <script>
        window.serverItem = document.querySelector('button');
        window.serverSlot = document.querySelector('nve-draggable-list').shadowRoot.querySelector('slot');
      </script>
      <script type="module">
        import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
        import '@nvidia-elements/foundations/draggable-list/define.js';
        const list = document.querySelector('nve-draggable-list');
        list.addEventListener('draggable-drop', ({detail}) => {
          const {source,target,placement}=detail;
          target.insertAdjacentElement(placement==='after'?'afterend':'beforebegin',source);
        });
        await list.updateComplete;
        document.body.dataset.ready='true';
      </script>`,
      async page => {
        await page.waitForFunction(() => document.body.dataset.ready === 'true');
        expect(
          await page.evaluate(
            () =>
              document.querySelector('button') === Reflect.get(window, 'serverItem') &&
              document.querySelector('nve-draggable-list')!.shadowRoot!.querySelector('slot') ===
                Reflect.get(window, 'serverSlot')
          )
        ).toBe(true);
        await page
          .getByRole('button', { name: '•', exact: true })
          .dragTo(page.getByRole('button', { name: '•••', exact: true }), { targetPosition: { x: 10, y: 35 } });
        expect(await page.locator('button').allTextContents()).toEqual(['••', '•••', '•']);
        await page.getByRole('button', { name: '•', exact: true }).focus();
        await page.keyboard.press('Space');
        await page.keyboard.press('Home');
        await page.keyboard.press('Enter');
        expect(await page.locator('button').allTextContents()).toEqual(['•', '••', '•••']);
      }
    );
  });
});
