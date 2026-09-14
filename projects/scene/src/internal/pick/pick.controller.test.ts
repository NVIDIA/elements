// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PickController } from './pick.controller.js';
import type { ScenePickDriver, ScenePickHit, ScenePickResult } from './routing.js';

const pickControllerHosts: HTMLElement[] = [];

class PickControllerTestHost extends HTMLElement {
  readonly #controllers = new Set<ReactiveController>();
  readonly ready = Promise.resolve();
  readonly updateComplete = Promise.resolve(true);

  addController(controller: ReactiveController): void {
    this.#controllers.add(controller);
  }

  removeController(controller: ReactiveController): void {
    this.#controllers.delete(controller);
  }

  requestUpdate(): void {}

  connectedCallback(): void {
    this.#controllers.forEach(controller => controller.hostConnected?.());
  }

  disconnectedCallback(): void {
    this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }
}

const pickControllerHostTag = 'scene-pick-controller-test-host';
if (!customElements.get(pickControllerHostTag)) customElements.define(pickControllerHostTag, PickControllerTestHost);

describe(PickController.name, () => {
  afterEach(() => {
    pickControllerHosts.forEach(host => host.remove());
    pickControllerHosts.length = 0;
    vi.restoreAllMocks();
  });

  it('keeps controlled drivers isolated between two connected controllers', async () => {
    const firstCalls: number[] = [];
    const secondCalls: number[] = [];
    const firstLayer = document.createElement('div');
    const secondLayer = document.createElement('div');
    const first = createController(request => {
      firstCalls.push(request.pixelX);
      return Promise.resolve(createResult(firstLayer));
    });
    const second = createController(request => {
      secondCalls.push(request.pixelX);
      return Promise.resolve(createResult(secondLayer));
    });

    await expect(first.picking.pick(10, 10)).resolves.toMatchObject({ layer: firstLayer });
    await expect(second.picking.pick(20, 10)).resolves.toMatchObject({ layer: secondLayer });

    expect(firstCalls).toEqual([10]);
    expect(secondCalls).toEqual([20]);
  });

  it('rejects an older controlled completion after disconnect without affecting a new controller', async () => {
    let resolveFirst!: (result: ScenePickResult | null) => void;
    const firstLayer = document.createElement('div');
    const secondLayer = document.createElement('div');
    const first = createController(() => new Promise(resolve => (resolveFirst = resolve)));
    const second = createController(() => Promise.resolve(createResult(secondLayer)));
    const pending = first.picking.pick(10, 10);
    await Promise.resolve();

    first.host.remove();
    resolveFirst(createResult(firstLayer));

    await expect(pending).rejects.toMatchObject({
      name: 'AbortError',
      message: 'The scene disconnected while picking.'
    });
    await expect(second.picking.pick(10, 10)).resolves.toMatchObject({ layer: secondLayer });
  });

  it('routes an accepted blocked pointer through the same typed driver boundary', async () => {
    const host = document.createElement(pickControllerHostTag) as PickControllerTestHost;
    const layer = Object.assign(document.createElement('div'), { interactive: true });
    vi.spyOn(layer, 'closest').mockImplementation(selector => (selector === 'nve-scene' ? host : null));
    host.append(layer);
    pickControllerHosts.push(host);
    const canvas = canvasWithRect();
    const picking = new PickController({
      driver: () => Promise.resolve(createResult(layer)),
      hasInteractiveTargets: () => true,
      host
    });
    document.body.append(host);
    picking.bindCanvas(canvas);
    const received: string[] = [];
    layer.addEventListener('pointerdown', event => received.push(`down:${event.isTrusted}`));
    layer.addEventListener('nve-scene-click', () => received.push('scene-click'));

    picking.handleUnhandledPointer({
      event: new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        clientX: 10,
        clientY: 10,
        pointerId: 7
      }),
      kind: 'pointerdown'
    });
    picking.handleUnhandledPointer({
      event: new PointerEvent('click', { bubbles: true, cancelable: true, clientX: 10, clientY: 10, pointerId: 7 }),
      kind: 'click'
    });

    await vi.waitFor(() => expect(received).toEqual(['down:false', 'scene-click']));
  });

  it('routes host pointer input only while its reactive host is connected', async () => {
    const driver = vi.fn(() => Promise.resolve(createResult(layer)));
    const { canvas, host, layer, picking } = createInteractiveController(driver);
    const clicks: PointerEvent[] = [];
    layer.addEventListener('click', event => clicks.push(event));
    const dispatchClick = (): void => {
      host.dispatchEvent(
        new CustomEvent('nve-pointer-input', {
          detail: {
            event: new PointerEvent('click', { clientX: 10, clientY: 10 }),
            kind: 'click'
          }
        })
      );
    };

    dispatchClick();
    await vi.waitFor(() => expect(clicks).toHaveLength(1));

    host.remove();
    dispatchClick();
    await Promise.resolve();
    expect(clicks).toHaveLength(1);

    document.body.append(host);
    picking.bindCanvas(canvas);
    dispatchClick();
    await vi.waitFor(() => expect(clicks).toHaveLength(2));
    expect(driver).toHaveBeenCalledTimes(2);
  });

  it('keeps one hover resolver, drops stale completions, and emits leave before the next enter', async () => {
    const pending: Array<(result: ScenePickResult | null) => void> = [];
    const { canvas, host, layer, picking } = createInteractiveController(
      () => new Promise(resolve => pending.push(resolve))
    );
    const events: string[] = [];
    layer.addEventListener('nve-scene-pointerenter', () => events.push('enter'));
    layer.addEventListener('nve-scene-pointerleave', () => events.push('leave'));

    picking.handleUnhandledPointer({
      event: new PointerEvent('pointermove', { clientX: 10, clientY: 10 }),
      kind: 'pointermove'
    });
    picking.handleUnhandledPointer({
      event: new PointerEvent('pointermove', { clientX: 20, clientY: 10 }),
      kind: 'pointermove'
    });
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    pending.shift()?.(createResult(layer));
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    pending.shift()?.(createResult(layer));
    await vi.waitFor(() => expect(events).toEqual(['enter']));

    canvas.dispatchEvent(new PointerEvent('pointerleave', { relatedTarget: document.body }));
    await vi.waitFor(() => expect(events).toEqual(['enter', 'leave']));
    expect(host.isConnected).toBe(true);
  });

  it('suppresses queued automatic interaction after availability changes while explicit picks remain full-scene', async () => {
    let interactive = true;
    let resolvePending!: (result: ScenePickResult | null) => void;
    const { host, layer, picking } = createInteractiveController(
      (_request, scope) =>
        scope === 'all'
          ? Promise.resolve(createResult(layer))
          : new Promise(resolve => {
              resolvePending = resolve;
            }),
      () => interactive
    );
    const received: string[] = [];
    host.addEventListener('click', () => received.push('click'));

    picking.handleUnhandledPointer({
      event: new PointerEvent('click', { clientX: 10, clientY: 10 }),
      kind: 'click'
    });
    await vi.waitFor(() => expect(resolvePending).toBeTypeOf('function'));
    interactive = false;
    picking.reconcileInteractionAvailability();
    resolvePending(createResult(layer));
    await Promise.resolve();
    expect(received).toEqual([]);
    await expect(picking.pick(10, 10)).resolves.toMatchObject({ layer });
  });

  it('keeps programmatic picks silent while ordering resolved pointer and click events', async () => {
    const pending: Array<(result: ScenePickResult | null) => void> = [];
    const { host, layer, picking } = createInteractiveController(() => new Promise(resolve => pending.push(resolve)));
    const events: string[] = [];
    host.addEventListener('pointerdown', event => events.push(`down:${event.target === layer}`));
    host.addEventListener('click', event => events.push(`click:${event.target === layer}`));
    layer.addEventListener('nve-scene-click', () => events.push('scene-click'));

    const programmatic = picking.pick(20, 20);
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    pending.shift()?.(createResult(layer));
    await expect(programmatic).resolves.toMatchObject({ element: layer, layer });
    expect(events).toEqual([]);

    picking.handleUnhandledPointer({
      event: new PointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 4 }),
      kind: 'pointerdown'
    });
    picking.handleUnhandledPointer({
      event: new PointerEvent('click', { clientX: 10, clientY: 10, pointerId: 4 }),
      kind: 'click'
    });
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending.shift()?.(createResult(layer));
    pending.shift()?.(createResult(layer));
    await vi.waitFor(() => expect(events).toEqual(['down:true', 'click:true', 'scene-click']));
  });

  it('keeps one active hover readback and resolves only the newest queued pointer location', async () => {
    let active = 0;
    let maximumActive = 0;
    const pending: Array<{
      readonly requestX: number;
      readonly resolve: (result: ScenePickResult | null) => void;
    }> = [];
    const { layer, picking } = createInteractiveController(request => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      return new Promise(resolve =>
        pending.push({
          requestX: request.clientX,
          resolve: result => {
            active -= 1;
            resolve(result);
          }
        })
      );
    });
    const enter = vi.fn();
    layer.addEventListener('nve-scene-pointerenter', enter);

    for (const clientX of [10, 20, 30, 40]) {
      picking.handleUnhandledPointer({
        event: new PointerEvent('pointermove', { clientX, clientY: 10 }),
        kind: 'pointermove'
      });
    }
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    expect(pending[0]?.requestX).toBe(10);
    pending[0]?.resolve(createResult(layer));
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    expect(pending[1]?.requestX).toBe(40);
    pending[1]?.resolve(createResult(layer));
    await vi.waitFor(() => expect(enter).toHaveBeenCalledTimes(1));
    expect(maximumActive).toBe(1);
  });

  it('dispatches instance hover crossings with source pointer metadata and ignores rejected readbacks', async () => {
    const pending: Array<{
      readonly reject: (reason: unknown) => void;
      readonly resolve: (result: ScenePickResult | null) => void;
    }> = [];
    const { layer, picking } = createInteractiveController(
      () => new Promise((resolve, reject) => pending.push({ reject, resolve }))
    );
    const events: string[] = [];
    layer.addEventListener('nve-scene-pointerenter', () => events.push('enter'));
    layer.addEventListener('nve-scene-pointerleave', event =>
      events.push(`leave:${(event as CustomEvent).detail.target.index}`)
    );

    picking.handleUnhandledPointer({
      event: new PointerEvent('pointermove', { buttons: 1, clientX: 4, clientY: 5, pointerId: 9 }),
      kind: 'pointermove'
    });
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    pending[0]?.resolve(createResult(layer));
    await vi.waitFor(() => expect(events).toEqual(['enter']));

    picking.handleUnhandledPointer({
      event: new PointerEvent('pointermove', { clientX: 7, clientY: 8, pointerId: 10 }),
      kind: 'pointermove'
    });
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[1]?.resolve({ ...createResult(layer), instanceIndex: 1, target: { index: 1, kind: 'instance' } });
    await vi.waitFor(() => expect(events).toEqual(['enter', 'leave:0', 'enter']));

    picking.handleUnhandledPointer({
      event: new PointerEvent('pointermove', { clientX: 8, clientY: 9 }),
      kind: 'pointermove'
    });
    await vi.waitFor(() => expect(pending).toHaveLength(3));
    pending[2]?.reject(new Error('readback failed'));
    await Promise.resolve();
    expect(events).toEqual(['enter', 'leave:0', 'enter']);
  });

  it('keeps hover stable across targets with the same layer-scoped feature ID', async () => {
    const pending: Array<(result: ScenePickResult | null) => void> = [];
    const { layer, picking } = createInteractiveController(() => new Promise(resolve => pending.push(resolve)));
    const events: string[] = [];
    layer.addEventListener('nve-scene-pointerenter', event =>
      events.push(`enter:${(event as CustomEvent<ScenePickHit>).detail.featureId}`)
    );
    layer.addEventListener('nve-scene-pointerleave', event => {
      const hit = (event as CustomEvent<ScenePickHit>).detail;
      events.push(`leave:${hit.featureId}:${hit.target.kind === 'instance' ? hit.target.index : 'other'}`);
    });

    requestHover(picking, 10);
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    pending[0]?.({ ...createResult(layer), featureId: 1842 });
    await vi.waitFor(() => expect(events).toEqual(['enter:1842']));

    requestHover(picking, 20);
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[1]?.({
      ...createResult(layer),
      featureId: 1842,
      instanceIndex: 1,
      target: { index: 1, kind: 'instance' }
    });
    await new Promise(resolve => setTimeout(resolve));
    expect(events).toEqual(['enter:1842']);

    requestHover(picking, 30);
    await vi.waitFor(() => expect(pending).toHaveLength(3));
    pending[2]?.({
      ...createResult(layer),
      featureId: 2710,
      instanceIndex: 2,
      target: { index: 2, kind: 'instance' }
    });
    await vi.waitFor(() => expect(events).toEqual(['enter:1842', 'leave:1842:1', 'enter:2710']));
  });

  it('clears hover on canvas exit, ignores its late completion, and accepts fresh reentry', async () => {
    const pending: Array<(result: ScenePickResult | null) => void> = [];
    const { canvas, layer, picking } = createInteractiveController(() => new Promise(resolve => pending.push(resolve)));
    const events: string[] = [];
    layer.addEventListener('nve-scene-pointerenter', () => events.push('enter'));
    layer.addEventListener('nve-scene-pointerleave', () => events.push('leave'));

    picking.handleUnhandledPointer({
      event: new PointerEvent('pointermove', { clientX: 10, clientY: 10 }),
      kind: 'pointermove'
    });
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    pending[0]?.(createResult(layer));
    await vi.waitFor(() => expect(events).toEqual(['enter']));
    picking.handleUnhandledPointer({
      event: new PointerEvent('pointermove', { clientX: 20, clientY: 20 }),
      kind: 'pointermove'
    });
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    canvas.dispatchEvent(new PointerEvent('pointerleave'));
    expect(events).toEqual(['enter', 'leave']);
    pending[1]?.(createResult(layer));
    await Promise.resolve();
    expect(events).toEqual(['enter', 'leave']);

    picking.handleUnhandledPointer({
      event: new PointerEvent('pointermove', { clientX: 30, clientY: 30 }),
      kind: 'pointermove'
    });
    await vi.waitFor(() => expect(pending).toHaveLength(3));
    pending[2]?.(createResult(layer));
    await vi.waitFor(() => expect(events).toEqual(['enter', 'leave', 'enter']));
  });

  it('does not dispatch an automatic click after its returned layer leaves the owning scene', async () => {
    let resolvePick!: (result: ScenePickResult | null) => void;
    const { layer, picking } = createInteractiveController(() => new Promise(resolve => (resolvePick = resolve)));
    const click = vi.fn();
    layer.addEventListener('click', click);
    picking.handleUnhandledPointer({
      event: new PointerEvent('click', { clientX: 10, clientY: 10 }),
      kind: 'click'
    });
    await vi.waitFor(() => expect(resolvePick).toBeTypeOf('function'));
    vi.spyOn(layer, 'closest').mockReturnValue(null);
    resolvePick(createResult(layer));
    await Promise.resolve();
    expect(click).not.toHaveBeenCalled();
  });
});

function createController(driver: ScenePickDriver): {
  readonly canvas: HTMLCanvasElement;
  readonly host: PickControllerTestHost;
  readonly picking: PickController;
} {
  const host = document.createElement(pickControllerHostTag) as PickControllerTestHost;
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
  pickControllerHosts.push(host);
  const picking = new PickController({
    driver,
    hasInteractiveTargets: () => false,
    host
  });
  document.body.append(host);
  picking.bindCanvas(canvas);
  return { canvas, host, picking };
}

function createInteractiveController(
  driver: ScenePickDriver,
  hasInteractiveTargets: () => boolean = () => true
): {
  readonly canvas: HTMLCanvasElement;
  readonly host: PickControllerTestHost;
  readonly layer: HTMLElement;
  readonly picking: PickController;
} {
  const host = document.createElement(pickControllerHostTag) as PickControllerTestHost;
  const layer = Object.assign(document.createElement('div'), { interactive: true });
  vi.spyOn(layer, 'closest').mockImplementation(selector => (selector === 'nve-scene' ? host : null));
  host.append(layer);
  pickControllerHosts.push(host);
  const canvas = canvasWithRect();
  const picking = new PickController({
    driver,
    hasInteractiveTargets,
    host
  });
  document.body.append(host);
  picking.bindCanvas(canvas);
  return { canvas, host, layer, picking };
}

function canvasWithRect(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
  return canvas;
}

function requestHover(picking: PickController, clientX: number): void {
  picking.handleUnhandledPointer({
    event: new PointerEvent('pointermove', { clientX, clientY: 10 }),
    kind: 'pointermove'
  });
}

function createResult(layer: HTMLElement, marker?: HTMLElement): ScenePickResult {
  return {
    clientX: 10,
    clientY: 10,
    instanceIndex: 0,
    layer,
    marker,
    target: { index: 0, kind: 'instance' },
    worldPosition: [0, 0, 0]
  };
}
