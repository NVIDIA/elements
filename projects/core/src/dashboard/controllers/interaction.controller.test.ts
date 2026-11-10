// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { DashboardInteractionController } from './interaction.controller.js';
import { resolveDashboardTarget } from '../utils/movement.utils.js';

import type { DashboardPointerPresentation } from './interaction.controller.js';

import type { DashboardLayout } from '../dashboard.types.js';

import '../define.js';

class InteractionTestHost extends LitElement {
  layout: DashboardLayout = {
    version: 1,
    grid: { flow: 'vertical', tracks: 4 },
    items: [{ id: 'notes', column: 0, row: 0, columnSpan: 2, rowSpan: 2 }]
  };
  presentation?: DashboardPointerPresentation;
  arrangementStateKey = 'current arrangement';
  permitted = true;
  readonly metrics = { columnSize: 149, rowSize: 120, gap: 8, width: 620, height: 320 };
  readonly commit = vi.fn((next: DashboardLayout) => {
    if (JSON.stringify(next) === this.value) return false;

    this.layout = next;

    return true;
  });
  readonly findPointerProposal = vi.fn(
    (
      layout: DashboardLayout,
      request: {
        id: string;
        intent: { geometry: { column: number; row: number; columnSpan: number; rowSpan: number } };
      }
    ) => ({
      ...layout,
      items: layout.items.map(item => (item.id === request.id ? { id: item.id, ...request.intent.geometry } : item))
    })
  );
  readonly findCommandProposal = vi.fn((layout: DashboardLayout, _id: string, _request: { command: string }) => layout);
  readonly reveal = vi.fn();
  readonly announce = vi.fn();
  readonly interaction = new DashboardInteractionController(this, {
    getLayout: () => this.layout,
    getArrangementStateKey: () => this.arrangementStateKey,
    getMetrics: () => this.metrics,
    getViewport: () => this.shadowRoot?.querySelector<HTMLElement>('.viewport') ?? undefined,
    isActionAllowed: () => this.permitted,
    findPointerProposal: this.findPointerProposal,
    getMovementTarget: resolveDashboardTarget,
    findCommandProposal: this.findCommandProposal,
    present: (_layout, presentation) => {
      this.presentation = presentation;
      this.requestUpdate();
    },
    commit: this.commit,
    reveal: this.reveal,
    announce: this.announce
  });

  get value() {
    return JSON.stringify(this.layout);
  }

  render() {
    return html`<div class="viewport" style="width:620px;height:320px;overflow:auto;position:relative"><div class="canvas" style="width:620px;height:320px;position:relative"><slot></slot></div></div>`;
  }
}

const tag = 'dashboard-interaction-test-host';
customElements.define(tag, InteractionTestHost);

describe('DashboardInteractionController', () => {
  let fixture: HTMLElement | undefined;
  let host: InteractionTestHost;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<dashboard-interaction-test-host><nve-dashboard-panel id="notes" style="left:0;top:0;width:306px;height:248px;--animation-duration:0ms;--animation-easing:ease"><nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>Application content</nve-dashboard-panel></dashboard-interaction-test-host>`
    );

    host = fixture.querySelector<InteractionTestHost>(tag)!;
    const panel = host.querySelector('nve-dashboard-panel')!;

    panel._configure({
      placed: true,
      movable: true,
      resizable: true,
      labels: { move: 'Move panel', resize: 'Resize panel' }
    });
    await rendered(host);
  });

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }

    vi.restoreAllMocks();
  });

  async function rendered(element: InteractionTestHost) {
    await elementIsStable(element);

    for (const panel of element.querySelectorAll('nve-dashboard-panel')) {
      await elementIsStable(panel);
    }

    await new Promise(requestAnimationFrame);
  }

  function pointer(type: string, x: number, y: number) {
    return new PointerEvent(type, {
      clientX: x,
      clientY: y,
      pointerId: 7,
      isPrimary: true,
      button: 0,
      buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
      bubbles: true,
      composed: true,
      cancelable: true
    });
  }

  function terminal(type: string, options: PointerEventInit) {
    return new PointerEvent(type, {
      pointerId: 7,
      isPrimary: true,
      button: 0,
      bubbles: true,
      composed: true,
      cancelable: true,
      ...options
    });
  }

  describe('pointer terminal ordering', () => {
    async function press(action: 'move' | 'resize', preview: boolean) {
      const panel = host.querySelector<HTMLElement>('#notes')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-action="${action}"]`)!;
      let owner = control;

      vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {
        owner = control;
      });
      vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {
        owner = host;
      });

      const box = control.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      const value = host.value;
      const change = host.commit;

      control.dispatchEvent(pointer('pointerdown', x, y));

      const endX = x + (action === 'move' ? 314 : 0);
      const endY = y + (action === 'resize' ? 128 : 0);
      const distance = preview ? 13 : 1;

      host.dispatchEvent(pointer('pointermove', x + distance, y + distance));
      await rendered(host);

      const previewStarted = host.presentation?.preview ?? false;

      if (preview) {
        host.dispatchEvent(pointer('pointermove', endX, endY));
        await rendered(host);
      }

      return { owner, x, y, endX, endY, value, change, previewStarted };
    }

    for (const { action, expectedPlacement } of [
      {
        action: 'move',
        expectedPlacement: { id: 'notes', column: 2, row: 0, columnSpan: 2, rowSpan: 2 }
      },
      {
        action: 'resize',
        expectedPlacement: { id: 'notes', column: 0, row: 0, columnSpan: 2, rowSpan: 3 }
      }
    ] as const) {
      for (const preview of [false, true]) {
        it(`commits ${action} once when released capture precedes pointerup ${preview ? 'after' : 'before'} the first preview`, async () => {
          const { owner, endX, endY, value, change, previewStarted } = await press(action, preview);

          expect(previewStarted).toBe(preview);
          expect(host.value).toBe(value);

          owner.dispatchEvent(terminal('lostpointercapture', { clientX: endX, clientY: endY, buttons: 0 }));
          host.dispatchEvent(pointer('pointerup', endX, endY));
          await rendered(host);

          expect(host.value).not.toBe(value);

          const placed = JSON.parse(host.value).items.find((item: { id: string }) => item.id === 'notes');

          expect(placed).toEqual(expectedPlacement);
          expect(change).toHaveBeenCalledOnce();
          expect(host.presentation).toBeUndefined();
        });
      }

      for (const { interruption, eventType } of [
        { interruption: 'held capture loss', eventType: 'lostpointercapture' },
        { interruption: 'pointer cancel', eventType: 'pointercancel' }
      ] as const) {
        it(`rolls back ${action} on ${interruption} and ignores a later release`, async () => {
          const { owner, endX, endY, value, change, previewStarted } = await press(action, true);

          expect(previewStarted).toBe(true);
          expect(host.value).toBe(value);

          owner.dispatchEvent(terminal(eventType, { clientX: endX, clientY: endY, buttons: 1 }));
          host.dispatchEvent(pointer('pointerup', endX, endY));
          await rendered(host);

          expect(host.value).toBe(value);
          expect(change).not.toHaveBeenCalled();
          expect(host.presentation).toBeUndefined();
        });
      }

      it(`ignores capture loss for another pointer during ${action}`, async () => {
        const { owner, x, y, endX, endY, value, change, previewStarted } = await press(action, true);

        expect(previewStarted).toBe(true);
        expect(host.value).toBe(value);

        owner.dispatchEvent(terminal('lostpointercapture', { pointerId: 9, clientX: x, clientY: y, buttons: 0 }));
        await rendered(host);

        expect(host.presentation?.preview).toBe(true);

        host.dispatchEvent(pointer('pointerup', endX, endY));
        await rendered(host);

        expect(host.value).not.toBe(value);
        expect(change).toHaveBeenCalledOnce();
      });

      it(`commits ${action} on an inferred released-buttons move and ignores pointerup duplication`, async () => {
        const { endX, endY, value, change, previewStarted } = await press(action, false);

        expect(previewStarted).toBe(false);
        expect(host.value).toBe(value);

        host.dispatchEvent(terminal('pointermove', { clientX: endX, clientY: endY, buttons: 0 }));
        await rendered(host);

        expect(host.value).not.toBe(value);
        expect(change).toHaveBeenCalledOnce();

        host.dispatchEvent(pointer('pointerup', endX, endY));
        await rendered(host);

        expect(change).toHaveBeenCalledOnce();
      });

      it(`keeps an unchanged ${action} release silent when capture ends first`, async () => {
        const { owner, x, y, value, change, previewStarted } = await press(action, false);

        expect(previewStarted).toBe(false);
        expect(host.value).toBe(value);

        owner.dispatchEvent(terminal('lostpointercapture', { clientX: x, clientY: y, buttons: 0 }));
        host.dispatchEvent(pointer('pointerup', x, y));
        await rendered(host);

        expect(host.value).toBe(value);
        expect(change).not.toHaveBeenCalled();
      });
    }
  });

  it.each([
    { action: 'move', key: 'ArrowLeft', command: '--move-left' },
    { action: 'move', key: 'ArrowRight', command: '--move-right' },
    { action: 'move', key: 'ArrowUp', command: '--move-up' },
    { action: 'move', key: 'ArrowDown', command: '--move-down' },
    { action: 'resize', key: 'ArrowLeft', command: '--decrease-width' },
    { action: 'resize', key: 'ArrowRight', command: '--increase-width' },
    { action: 'resize', key: 'ArrowUp', command: '--decrease-height' },
    { action: 'resize', key: 'ArrowDown', command: '--increase-height' }
  ])('decodes $key on the $action control as $command', ({ action, key, command }) => {
    const panel = host.querySelector('nve-dashboard-panel')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-action="${action}"]`)!;
    const event = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true });

    control.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(host.findCommandProposal).toHaveBeenCalledOnce();
    expect(host.findCommandProposal).toHaveBeenLastCalledWith(host.layout, 'notes', {
      command,
      placement: undefined
    });
  });

  it.each(['Enter', 'Escape', ' '])('leaves %s idle outside a pointer gesture', key => {
    const control = host
      .querySelector('nve-dashboard-panel')!
      .shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

    control.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));

    expect(host.findCommandProposal).not.toHaveBeenCalled();
  });

  it('ignores movement arrows when the panel is not permitted to move', () => {
    const control = host
      .querySelector('nve-dashboard-panel')!
      .shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

    host.permitted = false;
    control.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));

    expect(host.findCommandProposal).not.toHaveBeenCalled();
  });

  for (const flow of ['vertical', 'horizontal'] as const) {
    it(`maps Home and shifted bounded-axis arrows to start placement in ${flow} flow`, () => {
      host.layout = { ...host.layout, grid: { flow, tracks: 4 } };

      const control = host
        .querySelector('nve-dashboard-panel')!
        .shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

      control.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }));

      expect(host.findCommandProposal).toHaveBeenLastCalledWith(host.layout, 'notes', {
        command: '--move-to-start',
        placement: undefined
      });

      control.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: flow === 'vertical' ? 'ArrowRight' : 'ArrowDown',
          shiftKey: true,
          bubbles: true,
          composed: true
        })
      );

      expect(host.findCommandProposal).toHaveBeenLastCalledWith(host.layout, 'notes', {
        command: '--move-to-start',
        placement: {
          id: 'notes',
          column: flow === 'vertical' ? 1 : 0,
          row: flow === 'horizontal' ? 1 : 0,
          columnSpan: 2,
          rowSpan: 2
        }
      });
    });
  }

  for (const key of ['Escape', 'Enter']) {
    it(`reserves ${key} for a held pointer gesture while ordinary arrows remain idle`, async () => {
      const control = host
        .querySelector('nve-dashboard-panel')!
        .shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

      vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

      const box = control.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;

      control.dispatchEvent(pointer('pointerdown', x, y));
      host.dispatchEvent(pointer('pointermove', x + 314, y));
      await rendered(host);

      control.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));

      expect(host.findCommandProposal).not.toHaveBeenCalled();
      expect(host.presentation?.preview).toBe(true);

      control.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));

      expect(host.presentation).toBeUndefined();
      expect(host.commit).toHaveBeenCalledTimes(key === 'Enter' ? 1 : 0);

      host.dispatchEvent(pointer('pointerup', x + 314, y));

      expect(host.commit).toHaveBeenCalledTimes(key === 'Enter' ? 1 : 0);
    });
  }

  it('rejects a displayed preview when its arrangement state key changes before release', async () => {
    const initial = host.value;
    const control = host
      .querySelector('nve-dashboard-panel')!
      .shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    const box = control.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;

    control.dispatchEvent(pointer('pointerdown', x, y));
    host.dispatchEvent(pointer('pointermove', x + 314, y));
    await rendered(host);

    expect(host.presentation?.preview).toBe(true);

    host.arrangementStateKey = 'Changed arrangement permissions';
    host.dispatchEvent(pointer('pointerup', x + 314, y));

    expect(host.presentation).toBeUndefined();
    expect(host.commit).not.toHaveBeenCalled();
    expect(host.value).toBe(initial);
  });
});
