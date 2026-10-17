// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';
import type { WorkspacePanel } from '../panel/panel.js';
import type { WorkspacePanelHeader } from '../panel-header/panel-header.js';

export interface WorkspaceChrome {
  gap: number;
  panels?: Record<string, { suffixWidth: number; footerHeight: number }>;
  headerHeight: number;
  gripWidth: number;
  actionWidth: number;
  tabWidth: number;
  tabMinWidth: number;
  width: number;
  height: number;
}

interface PanelChrome {
  suffixWidth: number;
  suffixHeight: number;
  footerHeight: number;
}

interface ChromeOptions {
  panels: () => WorkspacePanel[];
  presented: (id: string) => boolean;
  carried: (id: string) => boolean;
  change: (chrome: WorkspaceChrome) => void;
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
  chrome: PanelChrome;
}

interface Observation {
  panel?: PanelMeasurement;
  axis: 'height' | 'both';
  width: number;
  height: number;
}

type ObserveNode = (node: Element | null, options: Pick<Observation, 'axis' | 'panel'>) => void;

/** Measures natural control sizes and the allocated viewport without feeding group geometry back into chrome. */
export class WorkspaceChromeController {
  readonly #host: HTMLElement & ReactiveControllerHost;
  readonly #options: ChromeOptions;

  #observer?: ResizeObserver;
  #observed = new Map<Element, Observation>();
  #panels: PanelMeasurement[] = [];
  #viewport?: HTMLElement;
  #viewportExtent?: { width: number; height: number };
  #probe?: Element;
  #intrinsic?: ReturnType<typeof measureProbe>;
  #dirty = true;
  #probeDirty = true;
  #current?: string;

  constructor(host: HTMLElement & ReactiveControllerHost, options: ChromeOptions) {
    this.#host = host;
    this.#options = options;
    host.addController(this);
  }

  hostConnected() {
    this.invalidate();
    this.#viewportExtent = undefined;
    this.#observer = new ResizeObserver(entries => {
      let changed = false;
      for (const entry of entries) changed = this.#measurementChanged(entry) || changed;
      if (changed) this.#measure();
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
    if (this.#dirty) this.#discover();
    this.#measure();
  }

  invalidate() {
    this.#dirty = true;
    this.#probeDirty = true;
  }

  #discover() {
    const root = this.#host.shadowRoot;
    const viewport = root?.querySelector<HTMLElement>('.viewport') ?? undefined;
    if (viewport !== this.#viewport) this.#viewportExtent = undefined;
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
      '.gap-probe, .tab-min-probe, .tab-probe, .chrome-header, nve-drag-handle, nve-icon-button'
    ))
      observe(node, { axis: 'both' });
    this.#discoverPanels(observe);
    this.#observeNodes(observed);
    this.#dirty = false;
  }

  #discoverPanels(observe: ObserveNode) {
    const previous = new Map(this.#panels.map(item => [item.panel, item]));
    this.#panels = this.#options.panels().map(panel => discoverPanel(panel, previous.get(panel)));
    for (const item of this.#panels) {
      observe(item.label, { axis: 'height', panel: item });
      observe(item.suffix, { axis: 'both', panel: item });
      observe(item.footer, { axis: 'height', panel: item });
      if (item.header && (!item.label || !item.suffix)) this.#awaitHeader(item);
    }
  }

  #observeNodes(observed: Map<Element, Observation>) {
    this.#observed.forEach((_, node) => {
      if (!observed.has(node)) this.#observer?.unobserve(node);
    });
    observed.forEach((_, node) => {
      if (!this.#observed.has(node))
        this.#observer?.observe(node, node === this.#viewport ? undefined : { box: 'border-box' });
    });
    this.#observed = observed;
  }

  #awaitHeader(item: PanelMeasurement) {
    const header = item.header!;
    void header.updateComplete.then(() => {
      if (!this.#host.isConnected || header.parentElement !== item.panel || item.panel.parentElement !== this.#host)
        return;
      this.invalidate();
      this.#host.requestUpdate();
    });
  }

  #measurementChanged(entry: ResizeObserverEntry) {
    if (entry.target === this.#viewport) return this.#measureViewport();
    const observed = this.#observed.get(entry.target);
    if (!observed) return false;
    const { width, height } = entry.target.getBoundingClientRect();
    const changed =
      Math.abs(observed.height - height) > 0.001 ||
      !Number.isFinite(observed.height) ||
      (observed.axis === 'both' && (Math.abs(observed.width - width) > 0.001 || !Number.isFinite(observed.width)));
    observed.width = width;
    observed.height = height;
    if (!changed) return false;
    if (observed.panel) observed.panel.dirty = true;
    else this.#probeDirty = true;
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
    if (!this.#viewportExtent) this.#measureViewport();
    const panels = Object.fromEntries(this.#panels.map(item => this.#measurePanel(item)));
    const headerless = this.#panels.some(
      item => !item.header && (this.#options.presented(item.panel.id) || this.#options.carried(item.panel.id))
    );
    const chrome: WorkspaceChrome = {
      gap: this.#intrinsic.gap,
      gripWidth: this.#intrinsic.gripWidth,
      actionWidth: this.#intrinsic.actionWidth,
      tabWidth: this.#intrinsic.tabWidth,
      tabMinWidth: this.#intrinsic.tabMinWidth,
      panels,
      headerHeight: Math.max(
        this.#intrinsic.headerHeight,
        headerless ? this.#intrinsic.headerlessHeight : 0,
        ...this.#panels.map(item =>
          this.#options.presented(item.panel.id) || this.#options.carried(item.panel.id) ? item.labelHeight : 0
        ),
        ...Object.values(panels).map(item => item.suffixHeight)
      ),
      width: this.#viewportExtent!.width,
      height: this.#viewportExtent!.height
    };
    const key = JSON.stringify(chrome);
    if (this.#current === key) return;
    this.#current = key;
    this.#options.change(chrome);
  }

  #measurePanel(item: PanelMeasurement): [string, PanelChrome] {
    const { panel } = item;
    const presented = this.#options.presented(panel.id);
    const refresh = item.dirty || (presented && !item.presented);
    item.presented = presented;
    if (!presented && !this.#options.carried(panel.id))
      return [panel.id, { suffixWidth: 0, footerHeight: 0, suffixHeight: 0 }];
    if (presented && refresh) {
      item.chrome = {
        ...measureSuffix(item.suffix),
        footerHeight: measureFooter(item, item.chrome.footerHeight)
      };
      item.labelHeight = extent(item.label, 'height');
      item.dirty = false;
    }
    return [panel.id, item.chrome];
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
    chrome: { suffixWidth: 0, footerHeight: 0, suffixHeight: 0 }
  };
  const header = panel.querySelector<WorkspacePanelHeader>(':scope > nve-workspace-panel-header');
  const label = header?.shadowRoot?.querySelector('.label-content') ?? null;
  if (item.label !== label) item.labelHeight = 0;
  item.header = header;
  item.label = label;
  item.suffix = header?.shadowRoot?.querySelector('.suffix-content') ?? null;
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
      extent(probe.querySelector('nve-icon-button'), 'height')
    ),
    headerlessHeight: extent(probe.querySelector('.chrome-header'), 'height'),
    gripWidth: extent(probe.querySelector('nve-drag-handle'), 'width'),
    tabWidth: extent(probe.querySelector('.tab-probe'), 'width'),
    tabMinWidth: extent(probe.querySelector('.tab-min-probe'), 'width'),
    actionWidth: tabActionWidth(probe)
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
  const button = probe.querySelector('nve-icon-button');
  const group = button?.closest('nve-tabs-item-group');
  return button && group ? Math.max(0, group.getBoundingClientRect().right - button.getBoundingClientRect().left) : 0;
}

function extent(element: Element | null, axis: 'width' | 'height') {
  return element?.getBoundingClientRect()[axis] ?? 0;
}
