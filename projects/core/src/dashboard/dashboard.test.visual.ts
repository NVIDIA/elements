// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { visualRunner } from '@internals/vite';

describe('dashboard visual', () => {
  for (const theme of ['', 'dark'] as const) {
    it(`renders ${theme || 'light'} default, custom, flat, and full appearances`, async () => {
      const report = await visualRunner.render(`dashboard${theme ? '.dark' : ''}`, appearanceTemplate(theme), {
        waitFor: async wait => {
          await wait(dashboardsReady);
        }
      });

      expect(report.maxDiffPercentage).toBeLessThan(1);
    });

    it(`renders ${theme || 'light'} inherited RTL placement and independently directed panel chrome`, async () => {
      const report = await visualRunner.render(`dashboard.rtl${theme ? '.dark' : ''}`, rightToLeftTemplate(theme), {
        waitFor: async wait => {
          await wait(dashboardsReady);
        }
      });

      expect(report.maxDiffPercentage).toBeLessThan(1);
    });

    it(`renders ${theme || 'light'} zero-gap borders around partial contacts`, async () => {
      await visualRunner.inspect(`dashboard.joined${theme ? '.dark' : ''}`, joinedTemplate(theme), async page => {
        await page.waitForFunction(dashboardsReady);
        await page.waitForFunction(() =>
          ['thin', 'thick'].every(prefix => {
            const a = document.querySelector(`#${prefix}-a`)!.getBoundingClientRect();
            const b = document.querySelector(`#${prefix}-b`)!.getBoundingClientRect();

            return Math.abs(a.right - b.left - (prefix === 'thin' ? 1 : 3)) < 0.04;
          })
        );
      });
    });

    it(`renders ${theme || 'light'} lifted panels, destination corners, and arrangement guides`, async () => {
      let releasePointer: (() => Promise<void>) | undefined;

      try {
        await visualRunner.inspect(
          `dashboard.arranging${theme ? '.dark' : ''}`,
          arrangementTemplate(theme),
          async page => {
            await page.waitForFunction(dashboardsReady);

            const handle = page.locator('#finding [data-dashboard-action="move"]');
            const bounds = await handle.boundingBox();
            if (!bounds) throw new Error('Missing movement control bounds');

            const distance = await page
              .locator('nve-dashboard')
              .evaluate(
                dashboard => (dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.clientWidth + 8) / 2
              );
            const x = bounds.x + bounds.width / 2;
            const y = bounds.y + bounds.height / 2;

            await page.mouse.move(x, y);
            await page.mouse.down();

            releasePointer = () => page.mouse.up();
            await page.mouse.move(x + distance - 13, y + 13);
            await page.waitForFunction(() => {
              const panel = document.querySelector('#finding');
              const canvas = document.querySelector('nve-dashboard')?.shadowRoot?.querySelector('.canvas');
              const ghost = canvas?.querySelector('nve-ghost');

              return (
                panel?.matches(':state(lifted)') &&
                ghost &&
                getComputedStyle(ghost).borderTopLeftRadius === '20px' &&
                getComputedStyle(canvas!).backgroundImage !== 'none' &&
                Math.abs(ghost.getBoundingClientRect().width - panel.getBoundingClientRect().width) < 0.04
              );
            });
          }
        );
      } finally {
        await releasePointer?.();
      }
    });

    it(`renders ${theme || 'light'} compact grip focus and a complete overlapping panel frame`, async () => {
      await visualRunner.inspect(`dashboard.focus${theme ? '.dark' : ''}`, focusTemplate(theme), async page => {
        await page.waitForFunction(dashboardsReady);

        const grip = page.locator('#focus-first [data-dashboard-action="move"]');

        await page.keyboard.press('Tab');

        expect(await grip.evaluate(control => control.matches(':focus-visible'))).toBe(true);
      });
    });
  }
});

function dashboardsReady() {
  const fixtures = [...document.querySelectorAll<HTMLElement>('[data-visual-fixture]')];
  const dashboards = [...document.querySelectorAll<HTMLElement>('[data-visual-dashboard]')];

  return (
    fixtures.every(fixture => fixture.scrollWidth <= fixture.clientWidth + 1) &&
    dashboards.length > 0 &&
    dashboards.every(dashboard => {
      const viewport = dashboard.shadowRoot?.querySelector<HTMLElement>('.viewport');
      const bounds = viewport?.getBoundingClientRect();
      if (!viewport || !bounds) return false;
      if (
        Math.abs(bounds.width - Number(dashboard.dataset.width)) > 0.04 ||
        Math.abs(bounds.height - Number(dashboard.dataset.height)) > 0.04 ||
        viewport.scrollWidth > viewport.clientWidth + 1 ||
        viewport.scrollHeight > viewport.clientHeight + 1
      ) {
        return false;
      }

      return [...dashboard.querySelectorAll('nve-dashboard-panel')].every(panel => {
        const body = panel.shadowRoot?.querySelector<HTMLElement>('.body');
        const panelBounds = panel.getBoundingClientRect();

        return (
          body &&
          body.clientHeight > 0 &&
          body.scrollWidth <= body.clientWidth + 1 &&
          body.scrollHeight <= body.clientHeight + 1 &&
          panelBounds.left >= bounds.left - 0.04 &&
          panelBounds.top >= bounds.top - 0.04 &&
          panelBounds.right <= bounds.left + viewport.clientWidth + 0.04 &&
          panelBounds.bottom <= bounds.top + viewport.clientHeight + 0.04
        );
      });
    })
  );
}

function appearanceTemplate(theme: '' | 'dark') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/dashboard/define.js';
      import '@nvidia-elements/core/icon-button/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div data-visual-fixture nve-layout="row gap:md pad:sm align:wrap" style="width:1120px">
      ${[
        { name: 'Default', container: '' },
        { name: 'Custom', container: '' },
        { name: 'Flat', container: 'flat' },
        { name: 'Full', container: 'full' }
      ]
        .map(({ name, container }) => {
          const value = JSON.stringify({
            version: 1,
            grid: { flow: 'vertical', tracks: 4 },
            items: [
              { id: `${name}-first`, column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
              { id: `${name}-second`, column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
              { id: `${name}-third`, column: 0, row: 2, columnSpan: 4, rowSpan: 2 }
            ]
          });
          return /* html */ `
          <nve-dashboard data-visual-dashboard data-width="540" data-height="360"
            ${container ? `container="${container}"` : ''} rearrangeable ${name === 'Default' ? 'fullscreenable' : ''}
            style="width:540px;height:360px;--row-size:80px;--gap:${container === 'full' ? 0 : 8}px;--animation-duration:0ms" value='${value}'>
            ${['first', 'second', 'third']
              .map(
                panel => /* html */ `
              <nve-dashboard-panel id="${name}-${panel}" ${name === 'Custom' ? 'style="--border-radius:var(--nve-ref-border-radius-xs);--border:var(--nve-ref-border-width-md) solid var(--nve-ref-border-color-emphasis)"' : ''}>
                <nve-dashboard-panel-header>•︎•︎•︎${panel === 'second' ? '<nve-icon-button slot="suffix" icon-name="more-actions" container="flat" size="sm" aria-label="Actions"></nve-icon-button>' : ''}</nve-dashboard-panel-header>
                <nve-dashboard-panel-content>•︎•︎•︎</nve-dashboard-panel-content>
                ${panel === 'first' ? '<nve-dashboard-panel-footer>•︎•︎•︎</nve-dashboard-panel-footer>' : ''}
              </nve-dashboard-panel>`
              )
              .join('')}
          </nve-dashboard>`;
        })
        .join('')}
    </div>`;
}

function arrangementTemplate(theme: '' | 'dark') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/dashboard/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div data-visual-fixture nve-layout="column pad:sm" style="width:744px">
      <nve-dashboard data-visual-dashboard data-width="720" data-height="360" rearrangeable
        style="width:720px;height:360px;--row-size:120px;--gap:8px;--animation-duration:0ms"
        value='{"version":1,"grid":{"flow":"vertical","tracks":4},"items":[{"id":"finding","column":0,"row":0,"columnSpan":2,"rowSpan":2},{"id":"summary","column":2,"row":0,"columnSpan":2,"rowSpan":2}]}'>
        <nve-dashboard-panel id="finding" style="--border-radius:20px">
          <nve-dashboard-panel-header>•︎•︎•︎</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>•︎•︎•︎</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>•︎•︎•︎</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="summary">
          <nve-dashboard-panel-header>•︎•︎•︎</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>•︎•︎•︎</nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
    </div>`;
}

function joinedTemplate(theme: '' | 'dark') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/dashboard/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div data-visual-fixture nve-layout="row gap:md pad:sm" style="width:880px">
      ${(['thin', 'thick'] as const)
        .map(prefix => {
          const items = [
            { id: `${prefix}-a`, column: 0, row: 0, columnSpan: 2, rowSpan: 4 },
            { id: `${prefix}-b`, column: 2, row: 0, columnSpan: 2, rowSpan: 1 },
            { id: `${prefix}-c`, column: 2, row: 3, columnSpan: 2, rowSpan: 1 },
            { id: `${prefix}-d`, column: 0, row: 4, columnSpan: 4, rowSpan: 1 }
          ];
          const value = JSON.stringify({ version: 1, grid: { flow: 'vertical', tracks: 4 }, items });
          return /* html */ `
          <nve-dashboard data-visual-dashboard data-width="420" data-height="660" container="full"
            style="width:420px;height:660px;--row-size:130px;--gap:0px;--animation-duration:0ms" value='${value}'>
            ${items
              .map(
                item => /* html */ `
              <nve-dashboard-panel id="${item.id}" style="--border:${prefix === 'thin' ? 1 : 3}px solid var(--nve-ref-border-color)">
                <nve-dashboard-panel-header>•︎•︎•︎</nve-dashboard-panel-header>
                <nve-dashboard-panel-content>•︎•︎•︎</nve-dashboard-panel-content>
              </nve-dashboard-panel>`
              )
              .join('')}
          </nve-dashboard>`;
        })
        .join('')}
    </div>`;
}

function focusTemplate(theme: '' | 'dark') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/dashboard/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <style>
      #focus-dashboard nve-dashboard-panel { --control-width:24px; --control-height:32px; }
      #focus-dashboard nve-dashboard-panel-header { --min-height:32px; --padding:4px 12px; }
    </style>
    <div data-visual-fixture nve-layout="column pad:sm" style="width:744px">
      <nve-dashboard id="focus-dashboard" data-visual-dashboard data-width="720" data-height="200" rearrangeable
        style="width:720px;height:200px;--row-size:160px;--gap:0px;--animation-duration:0ms"
        value='{"version":1,"grid":{"flow":"vertical","tracks":4},"items":[{"id":"focus-first","column":0,"row":0,"columnSpan":2,"rowSpan":1},{"id":"focus-second","column":2,"row":0,"columnSpan":2,"rowSpan":1}]}'>
        ${['first', 'second']
          .map(
            panel => /* html */ `
          <nve-dashboard-panel id="focus-${panel}">
            <nve-dashboard-panel-header>•︎•︎•︎</nve-dashboard-panel-header>
            <nve-dashboard-panel-content>•︎•︎•︎</nve-dashboard-panel-content>
          </nve-dashboard-panel>`
          )
          .join('')}
      </nve-dashboard>
    </div>`;
}

function rightToLeftTemplate(theme: '' | 'dark') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/dashboard/define.js';
      import '@nvidia-elements/core/icon-button/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div data-visual-fixture dir="rtl" nve-layout="column pad:sm" style="width:564px">
      <nve-dashboard data-visual-dashboard data-width="540" data-height="360" rearrangeable fullscreenable guides="visible"
        style="width:540px;height:360px;--row-size:84px;--gap:8px;--animation-duration:0ms"
        value='{"version":1,"grid":{"flow":"vertical","tracks":4},"items":[{"id":"rtl-baseline","column":0,"row":0,"columnSpan":2,"rowSpan":4},{"id":"rtl-candidate","column":2,"row":0,"columnSpan":2,"rowSpan":2},{"id":"rtl-notes","column":2,"row":2,"columnSpan":1,"rowSpan":2}]}'>
        <nve-dashboard-panel id="rtl-baseline">
          <nve-dashboard-panel-header>•︎•︎•︎</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>•︎•︎•︎</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>•︎•︎•︎</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="rtl-candidate" dir="ltr">
          <nve-dashboard-panel-header>•︎•︎•︎<nve-icon-button slot="suffix" icon-name="more-actions" container="flat" size="sm" aria-label="Actions"></nve-icon-button></nve-dashboard-panel-header>
          <nve-dashboard-panel-content>•︎•︎•︎</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>•︎•︎•︎</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="rtl-notes">
          <nve-dashboard-panel-header>•︎•︎•︎</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>•︎•︎•︎</nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
    </div>`;
}
