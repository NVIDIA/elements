// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { ViewportAutoFitController } from './viewport-autofit.controller.js';
import type { ViewportClientRect } from './viewport-fitting.utils.js';

class ViewportAutoFitControllerTestHost extends HTMLElement {
  readonly #controllers = new Set<ReactiveController>();
  readonly updateComplete = Promise.resolve(true);
  autoFit = false;
  hasUpdated = true;
  layoutHeight = 300;
  layoutWidth = 400;

  get clientHeight(): number {
    return this.layoutHeight;
  }

  get clientWidth(): number {
    return this.layoutWidth;
  }

  addController(controller: ReactiveController): void {
    this.#controllers.add(controller);
  }

  removeController(controller: ReactiveController): void {
    this.#controllers.delete(controller);
  }

  requestUpdate(): void {
    queueMicrotask(() => this.sync());
  }

  sync(): void {
    this.#controllers.forEach(controller => controller.hostUpdated?.());
  }

  connectedCallback(): void {
    this.#controllers.forEach(controller => controller.hostConnected?.());
  }

  disconnectedCallback(): void {
    this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }
}

class TestResizeObserver implements ResizeObserver {
  static readonly instances: TestResizeObserver[] = [];
  readonly disconnect = vi.fn();
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly #callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback;
    TestResizeObserver.instances.push(this);
  }

  notify(): void {
    this.#callback([], this);
  }

  static reset(): void {
    TestResizeObserver.instances.length = 0;
  }
}

const tag = 'viewport-autofit-controller-test-host';
if (!customElements.get(tag)) customElements.define(tag, ViewportAutoFitControllerTestHost);

type ApplyInitialFit = (clientRects: readonly ViewportClientRect[]) => void;

let animationFrameCallbacks = new Map<number, FrameRequestCallback>();

describe('ViewportAutoFitController', () => {
  let applyInitialFit: ReturnType<typeof vi.fn<ApplyInitialFit>>;
  let controller: ViewportAutoFitController;
  let fixture: HTMLElement;
  let host: ViewportAutoFitControllerTestHost;

  beforeEach(async () => {
    TestResizeObserver.reset();
    animationFrameCallbacks = new Map();
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(callback => {
      const frame = animationFrameCallbacks.size + 1;
      animationFrameCallbacks.set(frame, callback);
      return frame;
    });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(frame => {
      animationFrameCallbacks.delete(frame);
    });
    fixture = await createFixture(html`<div></div>`);
    const created = document.createElement(tag);
    if (!(created instanceof ViewportAutoFitControllerTestHost))
      throw new Error('Expected an autofit controller test host');
    host = created;
    applyInitialFit = vi.fn();
    controller = new ViewportAutoFitController(host, applyInitialFit);
    fixture.append(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('snapshots only the initial direct default-slot children', async () => {
    const initial = child({ height: 80, width: 120, x: 40, y: 30 });
    const named = child({ height: 80, width: 120, x: 200, y: 30 });
    named.slot = 'background';
    host.append(initial, named);

    enableAutoFit(host);
    await settleController();
    const late = child({ height: 80, width: 120, x: 360, y: 30 });
    host.append(late);
    applyScheduledFit();

    expect(applyInitialFit).toHaveBeenCalledWith([{ height: 80, left: 40, top: 30, width: 120 }]);
    expect(vi.mocked(named.getBoundingClientRect)).not.toHaveBeenCalled();
    expect(vi.mocked(late.getBoundingClientRect)).not.toHaveBeenCalled();
  });

  it('waits for nested custom-element definitions before scheduling layout', async () => {
    const custom = document.createElement(`viewport-autofit-nested-${crypto.randomUUID()}`);
    const wrapper = child({ height: 80, width: 120, x: 40, y: 30 });
    wrapper.append(custom);
    host.append(wrapper);

    enableAutoFit(host);
    await settleController();
    expect(TestResizeObserver.instances).toEqual([]);

    customElements.define(custom.localName, class extends HTMLElement {});
    await customElements.whenDefined(custom.localName);
    await settleController();
    applyScheduledFit();

    expect(applyInitialFit).toHaveBeenCalledOnce();
  });

  it('ignores explicitly hidden undefined elements', async () => {
    const hidden = document.createElement(`viewport-autofit-hidden-${crypto.randomUUID()}`);
    hidden.hidden = true;
    const measurable = child({ height: 80, width: 120, x: 40, y: 30 });
    host.append(hidden, measurable);

    enableAutoFit(host);
    await settleController();
    applyScheduledFit();

    expect(applyInitialFit).toHaveBeenCalledWith([{ height: 80, left: 40, top: 30, width: 120 }]);
  });

  it('waits for measurable host layout', async () => {
    host.layoutWidth = 0;
    host.append(child({ height: 80, width: 120, x: 40, y: 30 }));

    enableAutoFit(host);
    await settleController();
    resizeObserver().notify();
    expect(animationFrameCallbacks).toEqual(new Map());

    host.layoutWidth = 400;
    applyScheduledFit();

    expect(applyInitialFit).toHaveBeenCalledOnce();
  });

  it.each(['removed', 'reassigned'] as const)('filters children %s before fitting', async condition => {
    const initial = child({ height: 80, width: 120, x: 40, y: 30 });
    host.append(initial);

    enableAutoFit(host);
    await settleController();
    if (condition === 'removed') initial.remove();
    else initial.slot = 'background';
    applyScheduledFit();

    expect(applyInitialFit).not.toHaveBeenCalled();
  });

  it('consumes autofit when no initial child is measurable', async () => {
    const initial = child({ height: 0, width: 120, x: 40, y: 30 });
    host.append(initial);

    enableAutoFit(host);
    await settleController();
    applyScheduledFit();
    vi.mocked(initial.getBoundingClientRect).mockReturnValue(
      DOMRect.fromRect({ height: 80, width: 120, x: 40, y: 30 })
    );
    host.remove();
    fixture.append(host);
    await settleController();

    expect(applyInitialFit).not.toHaveBeenCalled();
    expect(TestResizeObserver.instances).toHaveLength(1);
  });

  it('cancels pending work when disconnected during each scheduling phase', async () => {
    const undefinedChild = document.createElement(`viewport-autofit-pending-${crypto.randomUUID()}`);
    host.append(undefinedChild);
    enableAutoFit(host);
    await settleController();
    host.remove();
    customElements.define(undefinedChild.localName, class extends HTMLElement {});
    await customElements.whenDefined(undefinedChild.localName);
    await settleController();

    expect(applyInitialFit).not.toHaveBeenCalled();
    expect(TestResizeObserver.instances).toEqual([]);

    fixture.append(host);
    await settleController();
    const observer = resizeObserver();
    host.remove();

    expect(observer.disconnect).toHaveBeenCalledOnce();

    fixture.append(host);
    await settleController();
    resizeObserver().notify();
    expect(animationFrameCallbacks).toHaveLength(1);
    host.remove();

    expect(animationFrameCallbacks).toEqual(new Map());
  });

  it('allows application or navigation ownership to consume a pending autofit', async () => {
    host.append(child({ height: 80, width: 120, x: 40, y: 30 }));

    enableAutoFit(host);
    await settleController();
    controller.consume();
    resizeObserver().notify();

    expect(applyInitialFit).not.toHaveBeenCalled();
    expect(animationFrameCallbacks).toEqual(new Map());
  });

  it('restarts after reconnecting and invalidates the disconnected generation', async () => {
    const custom = document.createElement(`viewport-autofit-reconnect-${crypto.randomUUID()}`);
    const initial = child({ height: 80, width: 120, x: 40, y: 30 });
    initial.append(custom);
    host.append(initial);

    enableAutoFit(host);
    await settleController();
    host.remove();
    customElements.define(custom.localName, class extends HTMLElement {});
    await customElements.whenDefined(custom.localName);
    fixture.append(host);
    await settleController();
    applyScheduledFit();

    expect(applyInitialFit).toHaveBeenCalledOnce();
  });

  it('becomes consumed before its callback, preventing reentrant duplicate application', async () => {
    host.append(child({ height: 80, width: 120, x: 40, y: 30 }));
    applyInitialFit.mockImplementation(() => {
      host.autoFit = false;
      host.sync();
      host.autoFit = true;
      host.sync();
    });

    enableAutoFit(host);
    await settleController();
    applyScheduledFit();
    await settleController();

    expect(applyInitialFit).toHaveBeenCalledOnce();
    expect(TestResizeObserver.instances).toHaveLength(1);
  });

  it('reads each eligible child bounding rectangle only once during the final fit', async () => {
    const first = child({ height: 80, width: 120, x: 40, y: 30 });
    const second = child({ height: 40, width: 60, x: 200, y: 160 });
    host.append(first, second);

    enableAutoFit(host);
    await settleController();
    applyScheduledFit();

    expect(first.getBoundingClientRect).toHaveBeenCalledOnce();
    expect(second.getBoundingClientRect).toHaveBeenCalledOnce();
  });
});

function applyScheduledFit(): void {
  resizeObserver().notify();
  for (const [frame, callback] of animationFrameCallbacks) {
    animationFrameCallbacks.delete(frame);
    callback(0);
    return;
  }
  throw new Error('Expected a scheduled animation frame');
}

function child(bounds: DOMRectInit): HTMLElement {
  const element = document.createElement('div');
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect(bounds));
  return element;
}

function enableAutoFit(host: ViewportAutoFitControllerTestHost): void {
  host.autoFit = true;
  host.sync();
}

function resizeObserver(): TestResizeObserver {
  const observer = TestResizeObserver.instances.at(-1);
  if (!observer) throw new Error('Expected a resize observer');
  return observer;
}

async function settleController(): Promise<void> {
  for (let index = 0; index < 4; index += 1) await Promise.resolve();
}
