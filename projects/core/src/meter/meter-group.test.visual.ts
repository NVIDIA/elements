// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { visualRunner, ssrRunner } from '@internals/vite';
import '@nvidia-elements/core/meter/define.js';

/* eslint-disable @nvidia-elements/lint/no-invalid-meter-group -- Deliberately exceeds capacity to verify clipping and accessibility. */
const overflow = /* html */ `
      <nve-meter-group aria-label="Overflow">
        <nve-meter aria-label="Apps" value="80" color="blue-cobalt"></nve-meter>
        <nve-meter aria-label="Media" value="80" color="teal-cyan"></nve-meter>
        <nve-meter aria-label="Empty" value="0"></nve-meter>
      </nve-meter-group>
`;
/* eslint-enable @nvidia-elements/lint/no-invalid-meter-group */

describe('meter-group visual', () => {
  it.each(['', 'dark'] as const)('should match the %s theme baseline', async theme => {
    await visualRunner.inspect(
      `meter-group${theme ? '.dark' : ''}`,
      /* html */ `
      <script type="module">
        import '@nvidia-elements/core/meter/define.js';
        document.documentElement.setAttribute('nve-theme', '${theme}');
      </script>
      <div nve-layout="column gap:md" style="width: 640px">
      <nve-meter-group aria-label="Partial">
        <nve-meter aria-label="Apps" value="20" color="blue-cobalt"></nve-meter>
        <nve-meter aria-label="Media" value="30" color="teal-cyan"></nve-meter>
      </nve-meter-group>
      <nve-meter-group aria-label="Full" style="--height: 12px">
        <nve-meter aria-label="Used" value="60" status="warning"></nve-meter>
        <nve-meter aria-label="Available" value="40" color="gray-slate"></nve-meter>
      </nve-meter-group>
      <nve-meter-group aria-label="RTL" dir="rtl">
        <nve-meter aria-label="Apps" value="20" color="blue-cobalt"></nve-meter>
        <nve-meter aria-label="Media" value="30" color="teal-cyan"></nve-meter>
      </nve-meter-group>
      ${overflow}
    </div>
    `,
      async page => {
        expect(
          await page
            .locator('nve-meter-group[aria-label="Partial"]')
            .evaluate(element => element.getBoundingClientRect().width)
        ).toBe(640);
        const session = await page.context().newCDPSession(page);
        try {
          const tree = await session.send('Accessibility.getFullAXTree');
          const meters = tree.nodes.filter(node => node.role?.value === 'meter');
          expect(meters).toHaveLength(9);
          expect(meters.find(node => node.name?.value === 'Empty')?.value?.value).toBe(0);
          expect(tree.nodes.filter(node => node.role?.value === 'group')).toHaveLength(4);
        } finally {
          await session.detach();
        }
      }
    );
  });

  it('should hydrate server meters and restore grouping without replacing children', async () => {
    const markup = await ssrRunner.render(html`
      <nve-meter-group aria-label="Storage" style="width: 400px">
        <nve-meter value="20" color="blue-cobalt" aria-label="Apps"></nve-meter>
        <nve-meter value="30" color="teal-cyan" aria-label="Media"></nve-meter>
      </nve-meter-group>
    `);
    await visualRunner.inspect(
      'meter-group.hydration',
      `${markup}
      <script>
        const group = document.querySelector('nve-meter-group');
        window.serverSlot = group.shadowRoot.querySelector('slot');
        window.serverMeter = group.firstElementChild;
        window.serverMeterWidth = group.firstElementChild.getBoundingClientRect().width;
      </script>
      <script type="module">
        import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
        import '@nvidia-elements/core/meter/define.js';
        const group = document.querySelector('nve-meter-group');
        await Promise.all([...group.children].map(meter => meter.updateComplete));
        await group.updateComplete;
        document.body.dataset.ready = 'true';
      </script>`,
      async page => {
        await page.waitForFunction(() => document.body.dataset.ready === 'true');
        expect(await page.evaluate(() => Reflect.get(window, 'serverMeterWidth'))).toBeCloseTo(79.8, 1);
        expect(
          await page.evaluate(() => {
            const group = document.querySelector('nve-meter-group')!;
            return (
              group.shadowRoot!.querySelector('slot') === Reflect.get(window, 'serverSlot') &&
              group.firstElementChild === Reflect.get(window, 'serverMeter')
            );
          })
        ).toBe(true);
        expect(
          await page
            .locator('nve-meter')
            .first()
            .evaluate(element => element.getBoundingClientRect().width)
        ).toBeCloseTo(79.8, 1);
        expect(await page.locator('nve-meter .fill').count()).toBe(2);
      }
    );
  });
});
