// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { visualRunner } from '@internals/vite';

const sizes = [
  { size: 'sm', surface: 104, thickness: 38.4, thumb: 19.2 },
  { size: 'md', surface: 130, thickness: 48, thumb: 24 },
  { size: 'lg', surface: 156, thickness: 57.6, thumb: 28.8 }
];
const constraints = ['circle', 'square', 'horizontal', 'vertical'];

describe('joystick visual', () => {
  it.each([
    { theme: '', name: 'light' },
    { theme: 'dark', name: 'dark' }
  ])('should match visual baseline in $name theme', async ({ theme }) => {
    await visualRunner.inspect(`joystick${theme ? '.dark' : ''}`, template(theme), async page => {
      await page.waitForFunction(() => customElements.get('nve-joystick'));
      for (const { size, surface, thickness, thumb } of sizes) {
        for (const constraint of constraints) {
          const control = page.locator(`[data-sizes] nve-joystick[size="${size}"][constraint="${constraint}"]`);
          const bounds = await control.boundingBox();
          expect(bounds?.width).toBeCloseTo(constraint === 'vertical' ? thickness : surface, 1);
          expect(bounds?.height).toBeCloseTo(constraint === 'horizontal' ? thickness : surface, 1);
          expect(
            await control.locator('.thumb').evaluate(element => element.getBoundingClientRect().width)
          ).toBeCloseTo(thumb, 1);
        }
      }
      const control = page.locator('nve-joystick').first();
      await control.evaluate(async element => {
        element.size = 'lg';
        await element.updateComplete;
      });
      expect(await control.getAttribute('size')).toBe('lg');
      expect(await control.boundingBox()).toMatchObject({ width: 156 });
      await control.evaluate(async element => {
        element.size = 'sm';
        await element.updateComplete;
      });
      await control.evaluate(element => element.style.setProperty('--width', '10rem'));
      expect(await control.boundingBox()).toMatchObject({ width: 160 });
      await control.evaluate(element => element.style.removeProperty('--width'));
      const controls = page.locator('[data-sizes] > div:first-child > nve-joystick:nth-child(-n + 2)');
      const travel = await controls.nth(0).boundingBox();
      const turn = await controls.nth(1).boundingBox();
      if (!travel || !turn) throw new Error('Joystick surfaces are missing.');
      const client = await page.context().newCDPSession(page);
      try {
        const first = { id: 1, x: travel.x + travel.width * 0.75, y: travel.y + travel.height / 2 };
        const second = { id: 2, x: turn.x + turn.width / 2, y: turn.y + turn.height * 0.25 };
        await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first] });
        await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first, second] });
        expect(await controls.nth(0).evaluate(element => element.value.x)).toBeGreaterThan(0.4);
        expect(await controls.nth(1).evaluate(element => element.value.y)).toBeLessThan(-0.4);
        expect(
          await controls.evaluateAll(elements => elements.every(element => element.matches(':state(active)')))
        ).toBe(true);
        await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        expect(await controls.nth(0).evaluate(element => element.value)).toEqual({ x: 0, y: 0 });
        expect(await controls.nth(1).evaluate(element => element.value)).toEqual({ x: 0, y: 0 });
      } finally {
        await client.detach();
      }
      const surface = page.locator('nve-joystick').first();
      const bounds = await surface.boundingBox();
      if (!bounds) throw new Error('Joystick surface is missing.');
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await page.mouse.down();
      await page.mouse.move(bounds.x + bounds.width + 80, bounds.y + bounds.height / 2);
      expect(await surface.evaluate(element => element.value.x)).toBeCloseTo(1);
      await page.mouse.up();
      expect(await surface.evaluate(element => element.value)).toEqual({ x: 0, y: 0 });
      await surface.focus();
      await page.keyboard.down('ArrowRight');
      expect(await surface.evaluate(element => element.value.x)).toBeCloseTo(0.1);
      await page.keyboard.up('ArrowRight');
      expect(await surface.evaluate(element => element.value)).toEqual({ x: 0, y: 0 });
      await surface.blur();
      await page.mouse.move(0, 0);
    });
  });
});

function template(theme = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/joystick/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div nve-layout="column gap:lg pad:lg">
      <div data-sizes nve-layout="column gap:lg">
        ${sizes
          .map(
            ({ size }) => /* html */ `
              <div nve-layout="row gap:lg">
                ${constraints
                  .map(
                    constraint => /* html */ `
                      <nve-joystick size="${size}" constraint="${constraint}" aria-label="${size} ${constraint}"></nve-joystick>
                    `
                  )
                  .join('')}
              </div>
            `
          )
          .join('')}
      </div>
      <div nve-layout="row gap:lg pad:lg" style="background: repeating-conic-gradient(var(--nve-sys-layer-overlay-background) 0% 25%, var(--nve-sys-layer-canvas-background) 0% 50%) center / 2rem 2rem;">
        <nve-joystick aria-label="Transparent background" opacity style="--opacity: 0"></nve-joystick>
        <nve-joystick aria-label="Half opaque background" opacity style="--opacity: 0.5"></nve-joystick>
        <nve-joystick aria-label="Translucent background" opacity></nve-joystick>
        <nve-joystick aria-label="Opaque background"></nve-joystick>
      </div>
      <div nve-layout="row gap:lg">
        <nve-joystick aria-label="Circle"></nve-joystick>
        <nve-joystick aria-label="Square" constraint="square" value='{"x":1,"y":-1}'></nve-joystick>
        <nve-joystick aria-label="Turn" constraint="horizontal" value='{"x":0.5,"y":0}'></nve-joystick>
        <nve-joystick aria-label="Vertical movement" constraint="vertical" value='{"x":0,"y":-0.5}'></nve-joystick>
        <nve-joystick aria-label="Recording" readonly value='{"x":0.4,"y":-0.6}'></nve-joystick>
        <nve-joystick aria-label="Unavailable" disabled></nve-joystick>
      </div>
    </div>
  `;
}
