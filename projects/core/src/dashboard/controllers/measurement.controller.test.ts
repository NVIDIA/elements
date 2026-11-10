// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { DashboardMeasurementController } from './measurement.controller.js';

import type { DashboardMetrics } from '../utils/geometry.utils.js';

import type { DashboardPanel } from '../panel/panel.js';

import '../define.js';

const observers: ControlledResizeObserver[] = [];

class ControlledResizeObserver implements ResizeObserver {
  readonly #callback: ResizeObserverCallback;
  readonly observe = vi.fn<ResizeObserver['observe']>();
  readonly unobserve = vi.fn<ResizeObserver['unobserve']>();
  readonly disconnect = vi.fn<ResizeObserver['disconnect']>();

  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback;
    observers.push(this);
  }

  deliver() {
    this.#callback([], this);
  }
}

class MeasurementTestHost extends LitElement {
  flow = 'vertical' as const;
  sizing = 'fit' as const;
  tracks = 6;
  readonly previous: (DashboardMetrics | undefined)[] = [];
  readonly pitchChanged = vi.fn(() => this.previous.push(this.measurement.metrics));
  readonly measurement: DashboardMeasurementController = new DashboardMeasurementController(this, {
    getPanels: () => [...this.querySelectorAll<DashboardPanel>('nve-dashboard-panel:not([hidden])')],
    getViewport: () => this.shadowRoot?.querySelector<HTMLElement>('.viewport') ?? undefined,
    getGrid: () => ({ flow: this.flow, tracks: this.tracks }),
    getSizing: () => this.sizing,
    pitchChanged: () => this.pitchChanged()
  });

  render() {
    return html`<div class="viewport" style="width:600px;height:400px"><slot></slot></div><div class="metric" style="width:140px;height:90px"></div><div class="gap-metric" style="width:12px;height:0"></div>`;
  }
}

const tag = 'dashboard-measurement-test-host';
customElements.define(tag, MeasurementTestHost);

function controlFrames() {
  const pending = new Map<number, FrameRequestCallback>();
  let next = 0;

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    pending.set(++next, callback);
    return next;
  });

  const cancel = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {
    pending.delete(id);
  });

  return {
    pending,
    cancel,
    flush() {
      const callbacks = [...pending.values()];

      pending.clear();
      callbacks.forEach(callback => callback(performance.now()));
    }
  };
}

describe('dashboard measurement controller', () => {
  let fixture: HTMLElement;
  let host: MeasurementTestHost;
  let viewport: HTMLElement;
  let observer: ControlledResizeObserver;
  let panels: DashboardPanel[];

  beforeEach(async () => {
    observers.length = 0;
    vi.stubGlobal('ResizeObserver', ControlledResizeObserver);

    fixture = await createFixture(
      html`<dashboard-measurement-test-host><nve-dashboard-panel id="a"></nve-dashboard-panel><nve-dashboard-panel id="b"></nve-dashboard-panel></dashboard-measurement-test-host>`
    );

    host = fixture.querySelector<MeasurementTestHost>(tag)!;

    await elementIsStable(host);
    await Promise.all(
      [...host.querySelectorAll<DashboardPanel>('nve-dashboard-panel')].map(panel => elementIsStable(panel))
    );

    viewport = host.shadowRoot!.querySelector<HTMLElement>('.viewport')!;

    host.measurement.observe();
    host.measurement.measure();
    host.pitchChanged.mockClear();
    host.previous.length = 0;

    observer = observers.find(candidate => candidate.observe.mock.calls.some(([target]) => target === viewport))!;

    panels = [...host.querySelectorAll<DashboardPanel>('nve-dashboard-panel')];
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('coalesces resize notifications and reports pitch changes before publishing the new metrics', () => {
    const frames = controlFrames();
    const previous = host.measurement.metrics;

    viewport.style.width = '480px';
    observer.deliver();
    observer.deliver();
    observer.deliver();

    expect(frames.pending.size).toBe(1);
    expect(host.measurement.metrics).toBe(previous);

    frames.flush();

    expect(host.pitchChanged).toHaveBeenCalledOnce();
    expect(host.previous).toEqual([previous]);
    expect(host.measurement.metrics).toMatchObject({ width: 480, height: 400, columnSize: 70, rowSize: 90, gap: 12 });
    expect(frames.pending.size).toBe(0);
  });

  it('keeps unchanged measurements silent instead of scheduling a continuing frame loop', () => {
    const frames = controlFrames();
    const previous = host.measurement.metrics;
    const update = vi.spyOn(host, 'requestUpdate');

    observer.deliver();
    observer.deliver();
    frames.flush();

    expect(host.measurement.metrics).toBe(previous);
    expect(host.pitchChanged).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(frames.pending.size).toBe(0);
  });

  it('calibrates only a uniform native border width across all supplied panel sides', () => {
    panels.forEach(panel => panel.style.setProperty('--border', '3px solid black'));
    host.measurement.measure();

    expect(host.style.getPropertyValue('--_geometry-border-width')).toBe('3px');

    panels[1]!.style.setProperty('--border', '5px solid black');
    host.measurement.measure();

    expect(host.style.getPropertyValue('--_geometry-border-width')).toBe('0px');

    panels[1]!.style.setProperty('--border', '3px solid black');
    panels[1]!.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!.style.borderLeftWidth = '1px';
    host.measurement.measure();

    expect(host.style.getPropertyValue('--_geometry-border-width')).toBe('0px');
  });

  it('replaces observation targets for same-ID panel replacement and hidden membership', async () => {
    const oldSurface = panels[0]!.shadowRoot!.querySelector('[internal-host]')!;
    const replacement = document.createElement('nve-dashboard-panel');

    replacement.id = 'a';
    panels[0]!.replaceWith(replacement);
    await replacement.updateComplete;

    const surface = replacement.shadowRoot!.querySelector('[internal-host]')!;

    host.measurement.observePanels();

    expect(observer.unobserve).toHaveBeenCalledWith(oldSurface);
    expect(observer.observe).toHaveBeenCalledWith(surface, { box: 'content-box' });

    replacement.hidden = true;
    host.measurement.observePanels();

    expect(observer.unobserve).toHaveBeenCalledWith(surface);
  });

  it('cancels pending measurement on disconnect and measures fresh geometry after reconnect', () => {
    const frames = controlFrames();

    observer.deliver();

    expect(frames.pending.size).toBe(1);

    host.remove();

    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(frames.cancel).toHaveBeenCalledOnce();
    expect(frames.pending.size).toBe(0);

    viewport.style.width = '480px';
    fixture.append(host);

    const reconnected = observers.find(
      candidate => candidate !== observer && candidate.observe.mock.calls.some(([target]) => target === viewport)
    )!;

    reconnected.deliver();
    frames.flush();

    expect(host.measurement.metrics?.width).toBe(480);
    expect(host.pitchChanged).toHaveBeenCalledOnce();
  });

  it('publishes unavailable geometry once and recovers without retaining an invalid pitch', () => {
    viewport.style.width = '0px';
    host.measurement.measure();

    expect(host.measurement.metrics).toBeUndefined();
    expect(host.pitchChanged).toHaveBeenCalledOnce();

    host.measurement.measure();

    expect(host.pitchChanged).toHaveBeenCalledOnce();

    viewport.style.width = '600px';
    host.measurement.measure();

    expect(host.measurement.metrics?.width).toBe(600);
    expect(host.pitchChanged).toHaveBeenCalledTimes(2);
  });
});
