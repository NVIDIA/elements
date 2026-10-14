// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, test } from 'vitest';
import type { Page } from 'playwright';
import { visualRunner } from '@internals/vite';

describe('scroll box visual', () => {
  let browserPage: Page | undefined;
  afterEach(async () => {
    await browserPage?.emulateMedia({ forcedColors: 'none' });
  });

  test.each(['', 'dark'])('scroll box should match visual baseline for theme %s', async theme => {
    const report = await visualRunner.render(`scroll-box${theme ? '.dark' : ''}`, template(theme), {
      waitFor: waitFor => waitFor(() => document.body.dataset.ready === 'true')
    });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('scroll box should support native keyboard scrolling and descendant focus', async () => {
    await visualRunner.inspect('scroll-box.focus', template(), async page => {
      browserPage = page;
      await page.waitForFunction(() => document.body.dataset.ready === 'true');
      const scrollBox = page.locator('#initial');
      await page.keyboard.press('Tab');
      await expect.poll(() => scrollBox.evaluate(element => element === document.activeElement)).toBe(true);
      await page.keyboard.press('ArrowDown');
      await expect.poll(() => scrollBox.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
      expect(await scrollBox.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
      await page.keyboard.press('Tab');
      expect(await scrollBox.locator('button').evaluate(element => element === document.activeElement)).toBe(true);
      await scrollBox.focus();
      await page.keyboard.press('End');
      await expect
        .poll(() => scrollBox.evaluate(element => element.scrollHeight - element.clientHeight - element.scrollTop))
        .toBe(0);
    });
  });

  test('scroll box should keep native scrolling in forced colors without decorative shadows', async () => {
    await visualRunner.inspect('scroll-box.forced-colors', template(), async page => {
      browserPage = page;
      await page.emulateMedia({ forcedColors: 'active' });
      await page.waitForFunction(() => document.body.dataset.ready === 'true');
      expect(await page.locator('#initial .shadow-layer').count()).toBe(1);
      expect(await page.locator('#initial .shadow-layer').evaluate(element => getComputedStyle(element).display)).toBe(
        'none'
      );
      await page.locator('#initial').evaluate(element => {
        element.scrollTop = 100;
      });
      expect(await page.locator('#initial').evaluate(element => element.scrollTop)).toBe(100);
    });
  });
});

function template(theme = '') {
  return /* html */ `
    <div nve-layout="row gap:md" style="padding: var(--nve-ref-size-400);">
      ${['initial', 'middle', 'end', 'rtl']
        .map(
          id => `
        <nve-scroll-box id="${id}" scroll-shadow role="region" aria-label="Activity"
          ${id === 'rtl' ? 'dir="rtl"' : ''} style="width: 180px; height: 150px; --scrollbar-width: none;">
          <div style="width: 360px; height: 300px; background: var(--nve-sys-layer-container-background);">
            <button type="button">•••</button>
          </div>
        </nve-scroll-box>
      `
        )
        .join('')}
    </div>
    <script type="module">
      import '@nvidia-elements/foundations/scroll-box/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
      await Promise.all([...document.querySelectorAll('nve-scroll-box')].map(element => element.updateComplete));
      await new Promise(requestAnimationFrame);
      document.querySelector('#middle').scrollTo(80, 70);
      document.querySelector('#end').scrollTo(1000, 1000);
      await new Promise(requestAnimationFrame);
      document.body.dataset.ready = 'true';
    </script>
  `;
}
