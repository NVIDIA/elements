// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';
import type { WorkspacePanel } from './workspace-panel.js';

export interface WorkspaceChrome {
  gap: number;
  panels?: Record<string, { suffixWidth: number; footerHeight: number }>;
  headerHeight: number;
  gripWidth: number;
  actionWidth: number;
  tabWidth: number;
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

/** Measures natural control sizes and the allocated viewport without feeding group geometry back into chrome. */
export class WorkspaceChromeController {
  readonly #host: HTMLElement & ReactiveControllerHost;

  readonly #options: ChromeOptions;

  #observer?: ResizeObserver;

  #observed = new Set<Element>();

  #labels = new WeakMap<Element, number>();

  #panelChrome = new WeakMap<Element, PanelChrome>();

  #current?: string;

  constructor(host: HTMLElement & ReactiveControllerHost, options: ChromeOptions) {
    this.#host = host;
    this.#options = options;
    host.addController(this);
  }

  hostConnected() {
    this.#observer = new ResizeObserver(() => this.#measure());
  }

  hostDisconnected() {
    this.#observer?.disconnect();
    this.#observed.clear();
  }

  hostUpdated() {
    const nodes = [...(this.#host.shadowRoot?.querySelectorAll('.viewport, [data-chrome], .gap-probe') ?? [])];
    this.#options.panels().forEach(panel => {
      const header = panel.querySelector(':scope > nve-workspace-panel-header');
      nodes.push(...(header?.shadowRoot?.querySelectorAll('.label-content, .suffix-content') ?? []));
      const footer = panel.querySelector(':scope > nve-workspace-panel-footer');
      if (footer) nodes.push(footer);
    });
    const next = new Set(nodes);
    this.#observed.forEach(node => {
      if (!next.has(node)) this.#observer?.unobserve(node);
    });
    next.forEach(node => {
      if (!this.#observed.has(node)) this.#observer?.observe(node);
    });
    this.#observed = next;
    this.#measure();
  }

  #measure() {
    const root = this.#host.shadowRoot;
    const viewport = root?.querySelector<HTMLElement>('.viewport');
    const probe = root?.querySelector<HTMLElement>('[data-chrome]');
    if (!viewport || !probe) return;
    const actionWidth = extent(probe.querySelector('nve-icon-button'), 'width');
    const panels = Object.fromEntries(this.#options.panels().map(panel => this.#measurePanel(panel)));
    const chrome: WorkspaceChrome = {
      gap: extent(probe.querySelector('.gap-probe'), 'width'),
      panels,
      headerHeight: Math.max(
        extent(probe.querySelector('.chrome-header'), 'height'),
        this.#labelHeight(),
        ...Object.values(panels).map(item => item.suffixHeight)
      ),
      gripWidth: extent(probe.querySelector('nve-drag-handle'), 'width'),
      tabWidth: extent(probe.querySelector('.tab-probe'), 'width'),
      actionWidth,
      width: viewport.clientWidth,
      height: viewport.clientHeight
    };
    const key = JSON.stringify(chrome);
    if (this.#current === key) return;
    this.#current = key;
    this.#options.change(chrome);
  }

  #measurePanel(panel: WorkspacePanel): [string, PanelChrome] {
    const presented = this.#options.presented(panel.id);
    const cached = this.#panelChrome.get(panel) ?? { suffixWidth: 0, footerHeight: 0, suffixHeight: 0 };
    if (!presented && !this.#options.carried(panel.id))
      return [panel.id, { suffixWidth: 0, footerHeight: 0, suffixHeight: 0 }];
    const suffix = panel
      .querySelector(':scope > nve-workspace-panel-header')
      ?.shadowRoot?.querySelector('.suffix-content');
    const metrics = {
      ...measureSuffix(suffix ?? null, { presented, cached }),
      footerHeight: measureFooter(panel, presented, cached.footerHeight)
    };
    this.#panelChrome.set(panel, metrics);
    return [panel.id, metrics];
  }

  #labelHeight() {
    return Math.max(0, ...this.#options.panels().map(panel => this.#panelLabelHeight(panel)));
  }

  #panelLabelHeight(panel: WorkspacePanel) {
    const label = panelLabelContent(panel);
    if (!label) return 0;
    if (!this.#options.presented(panel.id) && !this.#options.carried(panel.id)) return 0;
    if (this.#options.carried(panel.id)) return this.#labels.get(label) ?? 0;
    const result = label.getBoundingClientRect().height;
    this.#labels.set(label, result);
    return result;
  }
}

function measureSuffix(suffix: Element | null, { presented, cached }: { presented: boolean; cached: PanelChrome }) {
  if (!presented) return { suffixWidth: cached.suffixWidth, suffixHeight: cached.suffixHeight };
  if (!suffix) return { suffixWidth: 0, suffixHeight: 0 };
  return { suffixWidth: extent(suffix, 'width'), suffixHeight: extent(suffix, 'height') };
}

function measureFooter(panel: WorkspacePanel, presented: boolean, cached: number) {
  if (!presented || panel.getAttribute('aria-hidden') !== 'false') return cached;
  if (!panel.shadowRoot?.querySelector('.content:not([hidden])')) return cached;
  return extent(panel.querySelector(':scope > nve-workspace-panel-footer'), 'height');
}

function extent(element: Element | null, axis: 'width' | 'height') {
  return element?.getBoundingClientRect()[axis] ?? 0;
}

function panelLabelContent(panel: WorkspacePanel) {
  return panel
    .querySelector(':scope > nve-workspace-panel-header')
    ?.shadowRoot?.querySelector<HTMLElement>('.label-content');
}
