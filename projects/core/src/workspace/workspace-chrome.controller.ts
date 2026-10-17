// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';
import type { WorkspacePanel } from './workspace-panel.js';

export interface WorkspaceChrome {
  headerHeight: number;
  gripWidth: number;
  actionWidth: number;
  tabWidth: number;
  width: number;
  height: number;
}

interface ChromeOptions {
  panels: () => WorkspacePanel[];
  presented: (id: string) => boolean;
  carried: (id: string) => boolean;
  change: (chrome: WorkspaceChrome) => void;
}

/** Measures natural control sizes and the allocated viewport without feeding pane geometry back into chrome. */
export class WorkspaceChromeController {
  readonly #host: HTMLElement & ReactiveControllerHost;

  readonly #options: ChromeOptions;

  #observer?: ResizeObserver;

  #observed = new Set<Element>();

  #labels = new WeakMap<Element, number>();

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
    const nodes = [...(this.#host.shadowRoot?.querySelectorAll('.viewport, [data-chrome]') ?? [])];
    this.#options.panels().forEach(panel => {
      const label = panel.shadowRoot?.querySelector('.label-content');
      if (label) nodes.push(label);
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
    const actions = [...probe.querySelectorAll('.tab-action')];
    const actionWidth = Math.max(0, ...actions.map(action => action.getBoundingClientRect().width));
    const chrome: WorkspaceChrome = {
      headerHeight: Math.max(extent(probe.querySelector('.chrome-header'), 'height'), this.#labelHeight()),
      gripWidth: extent(probe.querySelector('nve-drag-handle'), 'width'),
      tabWidth: extent(probe.querySelector('.tab-probe'), 'width') + actionWidth * actions.length,
      actionWidth,
      width: viewport.clientWidth,
      height: viewport.clientHeight
    };
    const key = JSON.stringify(chrome);
    if (this.#current === key) return;
    this.#current = key;
    this.#options.change(chrome);
  }

  #labelHeight() {
    return Math.max(0, ...this.#options.panels().map(panel => this.#panelLabelHeight(panel)));
  }

  #panelLabelHeight(panel: WorkspacePanel) {
    const label = panel.shadowRoot?.querySelector<HTMLElement>('.label-content');
    const frame = label?.parentElement;
    if (!label || !frame) return 0;
    if (!this.#options.presented(panel.id)) return this.#options.carried(panel.id) ? (this.#labels.get(label) ?? 0) : 0;
    const style = getComputedStyle(frame);
    const height =
      label.getBoundingClientRect().height +
      (parseFloat(style.paddingTop) || 0) +
      (parseFloat(style.paddingBottom) || 0);
    this.#labels.set(label, height);
    return height;
  }
}

function extent(element: Element | null, axis: 'width' | 'height') {
  return element?.getBoundingClientRect()[axis] ?? 0;
}
