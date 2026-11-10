// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isServer, type ReactiveControllerHost } from 'lit';

import { haveSameGridPitch, resolveDashboardMetrics } from '../utils/geometry.utils.js';

import type { DashboardMetrics } from '../utils/geometry.utils.js';

import type { DashboardPanel } from '../panel/panel.js';

interface DashboardMeasurementHost extends HTMLElement, ReactiveControllerHost {
  readonly hasUpdated: boolean;
}

interface DashboardMeasurementDelegate {
  getPanels(): DashboardPanel[];
  getViewport(): HTMLElement | undefined;
  getGrid(): { flow: 'vertical' | 'horizontal'; tracks: number };
  getSizing(): 'fit' | 'fixed';
  pitchChanged(): void;
}

/** Measures viewport and cell geometry without owning arrangement policy. */
export class DashboardMeasurementController {
  readonly #host: DashboardMeasurementHost;
  readonly #delegate: DashboardMeasurementDelegate;
  #metrics?: DashboardMetrics;
  #resizeObserver?: ResizeObserver;
  #resizeFrame?: number;
  #borderTargets = new Set<HTMLElement>();

  constructor(host: DashboardMeasurementHost, delegate: DashboardMeasurementDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    host.addController(this);
  }

  get metrics() {
    return this.#metrics;
  }

  hostConnected() {
    if (isServer) return;

    this.#resizeObserver = new ResizeObserver(() => this.#scheduleMeasure());

    if (this.#host.hasUpdated) {
      this.observe();
    }
  }

  hostDisconnected() {
    this.#resizeObserver?.disconnect();

    if (this.#resizeFrame !== undefined) {
      cancelAnimationFrame(this.#resizeFrame);
    }

    this.#resizeFrame = undefined;
    this.#borderTargets.clear();
  }

  observe() {
    this.observePanels();

    for (const target of this.#host.shadowRoot?.querySelectorAll('.viewport, .metric, .gap-metric') ?? []) {
      this.#resizeObserver?.observe(target);
    }
  }

  observePanels() {
    if (!this.#host.isConnected) return;

    const next = new Set(
      this.#delegate.getPanels().flatMap(panel => {
        const surface = panel.shadowRoot?.querySelector<HTMLElement>('[internal-host]');
        return surface ? [surface] : [];
      })
    );

    for (const target of this.#borderTargets) {
      if (!next.has(target)) {
        this.#resizeObserver?.unobserve(target);
      }
    }

    for (const target of next) {
      if (!this.#borderTargets.has(target)) {
        this.#resizeObserver?.observe(target, { box: 'content-box' });
      }
    }

    this.#borderTargets = next;
  }

  #updateBorderWidth() {
    const widths = [...this.#borderTargets].flatMap(target => {
      const style = getComputedStyle(target);
      return [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(value =>
        Number.parseFloat(value)
      );
    });
    const first = widths[0];
    const width =
      this.#borderTargets.size === this.#delegate.getPanels().length &&
      first !== undefined &&
      Number.isFinite(first) &&
      first >= 0 &&
      widths.every(value => value === first)
        ? first
        : 0;
    const value = `${width}px`;

    if (this.#host.style.getPropertyValue('--_geometry-border-width') !== value) {
      this.#host.style.setProperty('--_geometry-border-width', value);
    }
  }

  #readMetrics() {
    const viewport = this.#delegate.getViewport();
    const metric = this.#host.shadowRoot?.querySelector<HTMLElement>('.metric');
    const gap = this.#host.shadowRoot?.querySelector<HTMLElement>('.gap-metric');
    if (!viewport || !metric || !gap) {
      return;
    }

    const box = metric.getBoundingClientRect();
    const spacing = gap.getBoundingClientRect();
    const grid = this.#delegate.getGrid();

    return resolveDashboardMetrics({
      ...grid,
      sizing: this.#delegate.getSizing(),
      width: viewport.clientWidth,
      height: viewport.clientHeight,
      columnSize: box.width,
      rowSize: box.height,
      gap: spacing.width,
      overlap: spacing.height
    });
  }

  #scheduleMeasure() {
    if (!this.#host.isConnected || this.#resizeFrame !== undefined) return;

    this.#resizeFrame = requestAnimationFrame(() => {
      this.#resizeFrame = undefined;

      if (this.#host.isConnected) {
        this.measure();
      }
    });
  }

  measure() {
    this.#updateBorderWidth();

    const next = this.#readMetrics();
    if (JSON.stringify(next) === JSON.stringify(this.#metrics)) return;

    if (!haveSameGridPitch(next, this.#metrics)) {
      this.#delegate.pitchChanged();
    }

    this.#metrics = next;
    this.#host.requestUpdate();
  }
}
