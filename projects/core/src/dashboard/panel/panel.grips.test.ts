// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { DashboardPanel } from '../index.js';

import '../define.js';

describe('dashboard panel arrangement control transitions', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }
  });

  it('animates real grip dimensions and empty footer space while disabling collapsed controls immediately', async () => {
    fixture =
      await createFixture(html`<div style="position:relative;width:700px;height:400px;--animation-duration:1000ms;--animation-easing:ease">
      <nve-dashboard-panel id="plain" style="left:0;top:0;width:344px;height:248px;--control-width:40px;--control-height:48px"><nve-dashboard-panel-header>Plain</nve-dashboard-panel-header><input value="draft" /></nve-dashboard-panel>
      <nve-dashboard-panel id="authored" style="left:356px;top:0;width:344px;height:248px;--control-width:40px;--control-height:48px"><nve-dashboard-panel-header>Authored</nve-dashboard-panel-header>Content<nve-dashboard-panel-footer><button>Footer action</button></nve-dashboard-panel-footer></nve-dashboard-panel>
    </div>`);

    const panel = fixture.querySelector<DashboardPanel>('#plain')!;
    const authored = fixture.querySelector<DashboardPanel>('#authored')!;

    const configure = async (enabled: boolean) => {
      for (const surface of [panel, authored]) {
        surface._configure({
          placed: true,
          movable: enabled,
          resizable: enabled,
          labels: { move: 'Move panel', resize: 'Resize panel' }
        });
        await elementIsStable(surface);
      }
    };

    await configure(false);

    const move = panel.shadowRoot!.querySelector<HTMLElement>('.move-grip')!;
    const resize = panel.shadowRoot!.querySelector<HTMLElement>('.resize-grip')!;
    const footer = panel.shadowRoot!.querySelector<HTMLElement>('.footer')!;
    const authoredFooter = authored.shadowRoot!.querySelector<HTMLElement>('.footer')!;
    const input = panel.querySelector('input')!;
    const authoredHeight = authoredFooter.getBoundingClientRect().height;

    const transitions = () =>
      [panel, authored].flatMap(p => p.shadowRoot!.querySelector('[internal-host]')!.getAnimations({ subtree: true }));

    const midpoint = async () => {
      await vi.waitFor(() => expect(move.getAnimations().length).toBeGreaterThan(0));

      for (const animation of transitions()) {
        animation.pause();
        animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
      }
    };

    const finish = async () => {
      for (const animation of transitions()) {
        animation.finish();
      }

      await new Promise(requestAnimationFrame);
    };

    expect(move.inert).toBe(true);
    expect(resize.inert).toBe(true);
    expect(move.getBoundingClientRect().width).toBe(0);
    expect(resize.getBoundingClientRect().height).toBe(0);
    expect(footer.inert).toBe(true);
    expect(footer.getBoundingClientRect().height).toBe(0);

    await configure(true);
    await midpoint();

    const targetWidth = 40;
    const targetHeight = 48;

    expect(move.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(move.getBoundingClientRect().width).toBeLessThan(targetWidth);
    expect(move.firstElementChild!.getBoundingClientRect().width).toBe(targetWidth);
    expect(move.firstElementChild!.getBoundingClientRect().height).toBe(targetHeight);
    expect(Number(getComputedStyle(move).opacity)).toBeGreaterThan(0);
    expect(Number(getComputedStyle(move).opacity)).toBeLessThan(1);
    expect(resize.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(resize.getBoundingClientRect().height).toBeLessThan(targetHeight);
    expect(footer.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(authoredFooter.getBoundingClientRect().height).toBeGreaterThanOrEqual(authoredHeight);

    const action = authored.querySelector('button')!;

    expect(action.getBoundingClientRect().bottom).toBeLessThanOrEqual(authoredFooter.getBoundingClientRect().bottom);

    await finish();
    await configure(false);

    expect(move.inert).toBe(true);
    expect(resize.inert).toBe(true);
    expect(panel.shadowRoot!.querySelector('.resize-edge')).toBeNull();
    expect(authoredFooter.inert).toBe(false);

    input.focus();
    move.querySelector<HTMLElement>('[data-dashboard-action]')!.focus();

    expect(document.activeElement).toBe(input);

    resize.querySelector<HTMLElement>('[data-dashboard-action]')!.focus();

    expect(document.activeElement).toBe(input);

    await midpoint();

    expect(move.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(resize.getBoundingClientRect().height).toBeGreaterThan(0);

    await configure(true);
    await finish();

    expect(panel.shadowRoot!.querySelector('.move-grip')).toBe(move);
    expect(panel.shadowRoot!.querySelector('.resize-grip')).toBe(resize);
    expect(move.inert).toBe(false);
    expect(resize.inert).toBe(false);
    expect(move.getBoundingClientRect().width).toBe(targetWidth);
    expect(resize.getBoundingClientRect().height).toBe(targetHeight);
    expect(getComputedStyle(move).opacity).toBe('1');
    expect(panel.querySelector('input')).toBe(input);
    expect(input.value).toBe('draft');
  });
});
