// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { ViewportAnimationController, type ViewportAnimationDelegate } from './viewport-animation.controller.js';
import type { ViewportTransform } from './viewport.types.js';

class ViewportAnimationControllerTestHost extends HTMLElement {
  readonly #controllers = new Set<ReactiveController>();
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

const tag = 'viewport-animation-controller-test-host';
if (!customElements.get(tag)) customElements.define(tag, ViewportAnimationControllerTestHost);

describe('ViewportAnimationController', () => {
  let applied: ViewportTransform[];
  let cancel: ReturnType<typeof vi.fn<(frame: number) => void>>;
  let clampScale: ReturnType<typeof vi.fn<(scale: number) => number>>;
  let controller: ViewportAnimationController;
  let fixture: HTMLElement;
  let frames: Map<number, FrameRequestCallback>;
  let host: ViewportAnimationControllerTestHost;
  let request: ReturnType<typeof vi.fn<(callback: FrameRequestCallback) => number>>;
  let transform: ViewportTransform;
  let viewportSize: { height: number; width: number };

  beforeEach(async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false }))
    );
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as ViewportAnimationControllerTestHost;
    transform = { scale: 1, x: 10, y: 20 };
    viewportSize = { height: 300, width: 400 };
    applied = [];
    frames = new Map();
    let nextFrame = 1;
    cancel = vi.fn();
    clampScale = vi.fn(scale => Math.min(4, Math.max(0.5, Number.isFinite(scale) && scale > 0 ? scale : 0.5)));
    request = vi.fn(callback => {
      const frame = nextFrame;
      nextFrame += 1;
      frames.set(frame, callback);
      return frame;
    });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(cancel);
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(request);
    const delegate: ViewportAnimationDelegate = {
      commitTransform: next => {
        transform = next;
        applied.push(next);
      },
      clampScale,
      getTransform: () => transform,
      getViewportSize: () => viewportSize
    };
    controller = new ViewportAnimationController(host, delegate);
    fixture.append(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('normalizes partial targets from the current transform and through the scale adapter', () => {
    controller.animateTo({ scale: 8, y: 40 }, { duration: 0 });

    expect(clampScale).toHaveBeenCalledWith(8);
    expect(applied).toEqual([{ scale: 4, x: 10, y: 40 }]);
  });

  it('does not schedule work for a normalized no-op target', () => {
    controller.animateTo({ x: 10, y: 20 });

    expect(request).not.toHaveBeenCalled();
    expect(applied).toEqual([]);
    expect(controller.destinationScale).toBeUndefined();
  });

  it('applies an explicit zero-duration target immediately', () => {
    controller.animateTo({ scale: 2, x: 30 }, { duration: 0 });

    expect(request).not.toHaveBeenCalled();
    expect(transform).toEqual({ scale: 2, x: 30, y: 20 });
  });

  it('applies a reduced-motion target immediately without scheduling a frame', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true }))
    );

    controller.animateTo({ scale: 2, x: 30 });

    expect(request).not.toHaveBeenCalled();
    expect(transform).toEqual({ scale: 2, x: 30, y: 20 });
  });

  it('interpolates an intermediate frame and schedules the next one', () => {
    controller.animateTo({ scale: 4, x: 100, y: 200 }, { duration: 100 });

    expect(request).toHaveBeenCalledOnce();
    expect(controller.destinationScale).toBe(4);

    runFrame(frames, 1, 250);

    expect(applied).toEqual([]);
    expect(request).toHaveBeenCalledTimes(2);

    runFrame(frames, 2, 300);

    expect(transform.scale).toBeCloseTo(2.3905, 4);
    expect(transform.x).toBeCloseTo(79.8005, 4);
    expect(transform.y).toBeCloseTo(159.601, 4);
    expect(request).toHaveBeenCalledTimes(3);
    expect(controller.destinationScale).toBe(4);
  });

  it('commits the normalized target at the terminal frame and clears its destination', () => {
    controller.animateTo({ scale: 8, x: 100, y: 200 }, { duration: 100 });

    runFrame(frames, 1, 250);
    runFrame(frames, 2, 350);

    expect(transform).toEqual({ scale: 4, x: 100, y: 200 });
    expect(request).toHaveBeenCalledTimes(2);
    expect(controller.destinationScale).toBeUndefined();
  });

  it('recomputes the target center after the viewport resizes', () => {
    const target = { scale: 4, x: 100, y: 200 };
    controller.animateTo(target, { duration: 100 });

    runFrame(frames, 1, 250);
    viewportSize = { height: 500, width: 600 };
    runFrame(frames, 2, 350);

    expect(applied).toEqual([target, target]);
  });

  it('cancels the scheduled frame and ignores a stale callback', () => {
    controller.animateTo({ scale: 2, x: 30 }, { duration: 100 });
    const callback = frames.get(1);
    expect(callback).toBeDefined();

    controller.cancel();
    callback?.(100);

    expect(cancel).toHaveBeenCalledWith(1);
    expect(controller.destinationScale).toBeUndefined();
    expect(transform).toEqual({ scale: 1, x: 10, y: 20 });
  });

  it('replaces an active animation with its new destination', () => {
    controller.animateTo({ scale: 2 }, { duration: 100 });
    controller.animateTo({ scale: 4 }, { duration: 100 });

    expect(cancel).toHaveBeenCalledWith(1);
    expect(request).toHaveBeenCalledTimes(2);
    expect(controller.destinationScale).toBe(4);
  });

  it('cancels pending animation work when its host disconnects', () => {
    controller.animateTo({ scale: 2 }, { duration: 100 });

    host.remove();

    expect(cancel).toHaveBeenCalledWith(1);
    expect(controller.destinationScale).toBeUndefined();
  });
});

function runFrame(frames: ReadonlyMap<number, FrameRequestCallback>, frame: number, time: number): void {
  const callback = frames.get(frame);
  expect(callback).toBeDefined();
  callback?.(time);
}
