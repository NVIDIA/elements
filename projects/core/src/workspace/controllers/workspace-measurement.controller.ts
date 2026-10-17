// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

import { sameWorkspaceMeasurements } from '../utils/presentation/measurements.utils.js';

import type {
  WorkspaceMeasurementChange,
  WorkspaceMeasurements,
  WorkspacePanelMeasurements
} from '../utils/presentation/measurements.utils.js';

import type { WorkspacePanelHeader } from '../panel-header/panel-header.js';
import type { WorkspacePanel } from '../panel/panel.js';

interface WorkspaceMeasurementDelegate {
  readonly getPanels: () => WorkspacePanel[];
  readonly isPresented: (id: string) => boolean;
  readonly isCarried: (id: string) => boolean;
  readonly applyMeasurements: (change: WorkspaceMeasurementChange) => void;
}

interface PanelMeasurement {
  panel: WorkspacePanel;
  header: WorkspacePanelHeader | null;
  label: Element | null;
  suffix: Element | null;
  footer: Element | null;
  dirty: boolean;
  presented: boolean;
  labelHeight: number;
  suffixHeight: number;
  measurements: WorkspacePanelMeasurements;
}

interface Observation {
  panel?: PanelMeasurement;
  axis: 'height' | 'both';
  width: number;
  height: number;
}

type ObserveNode = (node: Element | null, options: Pick<Observation, 'axis' | 'panel'>) => void;

const emptyPanelMeasurements: WorkspacePanelMeasurements = { suffixWidth: 0, footerHeight: 0 };

/** Measures intrinsic controls and viewport dimensions independently of allocated group geometry. */
export class WorkspaceMeasurementController {
  readonly #host: HTMLElement & ReactiveControllerHost;
  readonly #delegate: WorkspaceMeasurementDelegate;

  #observer?: ResizeObserver;
  #observed = new Map<Element, Observation>();
  #panels: PanelMeasurement[] = [];
  #viewport?: HTMLElement;
  #viewportExtent?: { width: number; height: number };
  #probe?: Element;
  #intrinsic?: ReturnType<typeof measureProbe>;
  #dirty = true;
  #probeDirty = true;
  #publishedMeasurements?: WorkspaceMeasurements;

  constructor(host: HTMLElement & ReactiveControllerHost, delegate: WorkspaceMeasurementDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    host.addController(this);
  }

  hostConnected() {
    this.invalidate();
    this.#viewportExtent = undefined;
    this.#observer = new ResizeObserver(entries => {
      let changed = false;
      for (const entry of entries) {
        changed = this.#updateObservation(entry) || changed;
      }
      if (changed) {
        this.#measure();
      }
    });
  }

  hostDisconnected() {
    this.#observer?.disconnect();
    this.#observed.clear();
    this.#panels = [];
    this.#viewport = undefined;
    this.#probe = undefined;
    this.#viewportExtent = undefined;
    this.#intrinsic = undefined;
  }

  hostUpdated() {
    if (this.#dirty) {
      this.#discover();
    }
    this.#measure();
  }

  invalidate() {
    this.#dirty = true;
    this.#probeDirty = true;
  }

  #discover() {
    const root = this.#host.shadowRoot;
    const viewport = root?.querySelector<HTMLElement>('.viewport') ?? undefined;
    if (viewport !== this.#viewport) {
      this.#viewportExtent = undefined;
    }
    this.#viewport = viewport;
    this.#probe = root?.querySelector('[data-chrome]') ?? undefined;
    if (!this.#viewport || !this.#probe) return;
    const observed = new Map<Element, Observation>();
    const observe = (node: Element | null, options: Pick<Observation, 'axis' | 'panel'>) => {
      if (!node) return;
      observed.set(node, { width: NaN, height: NaN, ...this.#observed.get(node), ...options });
    };
    observe(this.#viewport, { axis: 'both' });
    for (const node of this.#probe.querySelectorAll(
      '.gap-probe, .tab-min-probe, .tab-probe, .chrome-header, .group-actions, nve-drag-handle, nve-icon-button'
    )) {
      observe(node, { axis: 'both' });
    }
    this.#discoverPanels(observe);
    this.#observeNodes(observed);
    this.#dirty = false;
  }

  #discoverPanels(observe: ObserveNode) {
    const previous = new Map(this.#panels.map(item => [item.panel, item]));
    this.#panels = this.#delegate.getPanels().map(panel => discoverPanel(panel, previous.get(panel)));
    for (const item of this.#panels) {
      observe(item.label, { axis: 'height', panel: item });
      observe(item.suffix, { axis: 'both', panel: item });
      observe(item.footer, { axis: 'height', panel: item });
      if (item.header && (!item.label || !item.suffix)) {
        void this.#awaitHeader(item);
      }
    }
  }

  #observeNodes(observed: Map<Element, Observation>) {
    this.#observed.forEach((_, node) => {
      if (!observed.has(node)) {
        this.#observer?.unobserve(node);
      }
    });
    observed.forEach((_, node) => {
      if (!this.#observed.has(node)) {
        this.#observer?.observe(node, node === this.#viewport ? undefined : { box: 'border-box' });
      }
    });
    this.#observed = observed;
  }

  async #awaitHeader(item: PanelMeasurement) {
    const header = item.header!;
    await header.updateComplete;

    if (!this.#host.isConnected || header.parentElement !== item.panel || item.panel.parentElement !== this.#host) {
      return;
    }

    this.invalidate();
    this.#host.requestUpdate();
  }

  #updateObservation(entry: ResizeObserverEntry) {
    if (entry.target === this.#viewport) return this.#measureViewport();
    const observed = this.#observed.get(entry.target);
    if (!observed) return false;
    const { width, height } = entry.target.getBoundingClientRect();
    const changed =
      observed.height !== height ||
      !Number.isFinite(observed.height) ||
      (observed.axis === 'both' && (observed.width !== width || !Number.isFinite(observed.width)));
    observed.width = width;
    observed.height = height;
    if (!changed) return false;
    if (observed.panel) {
      observed.panel.dirty = true;
    } else {
      this.#probeDirty = true;
    }
    return true;
  }

  #measureViewport() {
    if (!this.#viewport) return false;
    const width = this.#viewport.clientWidth;
    const height = this.#viewport.clientHeight;
    if (width === this.#viewportExtent?.width && height === this.#viewportExtent.height) return false;
    this.#viewportExtent = { width, height };
    return true;
  }

  #measure() {
    if (!this.#viewport || !this.#probe) return;
    if (this.#probeDirty || !this.#intrinsic) {
      this.#intrinsic = measureProbe(this.#probe);
      this.#probeDirty = false;
    }
    if (!this.#viewportExtent) {
      this.#measureViewport();
    }
    const { panels, headerHeight } = this.#measurePanels(this.#intrinsic);
    const measurements: WorkspaceMeasurements = {
      gap: this.#intrinsic.gap,
      gripWidth: this.#intrinsic.gripWidth,
      actionWidth: this.#intrinsic.actionWidth,
      groupActionWidth: this.#intrinsic.groupActionWidth,
      tabWidth: this.#intrinsic.tabWidth,
      tabMinWidth: this.#intrinsic.tabMinWidth,
      panels,
      headerHeight,
      width: this.#viewportExtent!.width,
      height: this.#viewportExtent!.height
    };
    this.#publish(measurements);
  }

  #measurePanels(intrinsic: ReturnType<typeof measureProbe>) {
    const panels = Object.create(null) as Record<string, WorkspacePanelMeasurements>;
    let headerHeight = intrinsic.headerHeight;
    for (const item of this.#panels) {
      const presented = this.#delegate.isPresented(item.panel.id);
      const carried = !presented && this.#delegate.isCarried(item.panel.id);
      this.#measurePanel(item, presented);
      panels[item.panel.id] = presented || carried ? item.measurements : emptyPanelMeasurements;
      if (!presented && !carried) continue;

      headerHeight = Math.max(headerHeight, item.labelHeight, item.suffixHeight);
      if (!item.header) {
        headerHeight = Math.max(headerHeight, intrinsic.headerlessHeight);
      }
    }
    return { panels, headerHeight };
  }

  #measurePanel(item: PanelMeasurement, presented: boolean) {
    const refresh = item.dirty || (presented && !item.presented);
    item.presented = presented;
    if (!presented || !refresh) return;

    const { suffixWidth, suffixHeight } = measureSuffix(item.suffix);
    const footerHeight = measureFooter(item, item.measurements.footerHeight);
    if (suffixWidth !== item.measurements.suffixWidth || footerHeight !== item.measurements.footerHeight) {
      item.measurements = { suffixWidth, footerHeight };
    }
    item.suffixHeight = suffixHeight;
    item.labelHeight = extent(item.label, 'height');
    item.dirty = false;
  }

  #publish(measurements: WorkspaceMeasurements) {
    const previous = this.#publishedMeasurements;
    if (sameWorkspaceMeasurements(previous, measurements)) return;

    const spaceChanged =
      measurements.width !== (previous?.width ?? 0) ||
      measurements.height !== (previous?.height ?? 0) ||
      measurements.gap !== (previous?.gap ?? 0);
    this.#publishedMeasurements = measurements;
    this.#delegate.applyMeasurements({ measurements, spaceChanged });
  }
}

function discoverPanel(panel: WorkspacePanel, previous?: PanelMeasurement): PanelMeasurement {
  const item = previous ?? {
    panel,
    header: null,
    label: null,
    suffix: null,
    footer: null,
    dirty: true,
    presented: false,
    labelHeight: 0,
    suffixHeight: 0,
    measurements: emptyPanelMeasurements
  };
  const header = panel.querySelector<WorkspacePanelHeader>(':scope > nve-workspace-panel-header');
  const targets = header?._getMeasurementTargets();
  const label = targets?.label ?? null;
  if (item.label !== label) {
    item.labelHeight = 0;
  }
  item.header = header;
  item.label = label;
  item.suffix = targets?.suffix ?? null;
  item.footer = panel.querySelector(':scope > nve-workspace-panel-footer');
  item.dirty = true;
  return item;
}

function measureProbe(probe: Element) {
  return {
    gap: extent(probe.querySelector('.gap-probe'), 'width'),
    headerHeight: Math.max(
      extent(probe.querySelector('.tab-probe'), 'height'),
      extent(probe.querySelector('nve-drag-handle'), 'height'),
      extent(probe.querySelector('[part~="close-button"]'), 'height'),
      extent(probe.querySelector('[part~="fullscreen-button"]'), 'height')
    ),
    headerlessHeight: extent(probe.querySelector('.chrome-header'), 'height'),
    gripWidth: extent(probe.querySelector('nve-drag-handle'), 'width'),
    tabWidth: extent(probe.querySelector('.tab-probe'), 'width'),
    tabMinWidth: extent(probe.querySelector('.tab-min-probe'), 'width'),
    actionWidth: tabActionWidth(probe),
    groupActionWidth: extent(probe.querySelector('.group-actions'), 'width')
  };
}

function measureSuffix(suffix: Element | null) {
  if (!suffix) return { suffixWidth: 0, suffixHeight: 0 };
  return { suffixWidth: extent(suffix, 'width'), suffixHeight: extent(suffix, 'height') };
}

function measureFooter(item: PanelMeasurement, cached: number) {
  if (item.panel.getAttribute('aria-hidden') !== 'false') return cached;
  if (!item.panel.shadowRoot?.querySelector('.content:not([hidden])')) return cached;
  return extent(item.footer, 'height');
}

function tabActionWidth(probe: Element) {
  const button = probe.querySelector('[part~="close-button"]');
  const group = button?.closest('nve-tabs-item-group');
  return button && group ? Math.max(0, group.getBoundingClientRect().right - button.getBoundingClientRect().left) : 0;
}

function extent(element: Element | null, axis: 'width' | 'height') {
  return element?.getBoundingClientRect()[axis] ?? 0;
}
