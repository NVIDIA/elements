// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isServer, type ReactiveControllerHost } from 'lit';

import {
  getActiveElement,
  getCustomElementRegistry,
  matchesElementName,
  type Rect
} from '@nvidia-elements/core/internal';

import {
  getDashboardClientRect,
  getDashboardPixelPlacement,
  getDashboardPlacementClientRect,
  getProjectedControlRect,
  getRevealScrollDelta,
  haveSameGridPitch
} from '../utils/geometry.utils.js';
import { serializeDashboardValue } from '../utils/layout.utils.js';
import { isDashboardCatalogueMutation, isDashboardTitleMutation } from '../utils/mutation.utils.js';

import { DashboardPanel } from '../panel/panel.js';

import type { DashboardFullscreenController } from './fullscreen.controller.js';
import type { DashboardPointerPresentation } from './interaction.controller.js';
import type { DashboardMetrics, DashboardPixelPlacement } from '../utils/geometry.utils.js';
import type { DashboardAction } from '../utils/intent.types.js';

import type { DashboardItem, DashboardLayout } from '../dashboard.types.js';

interface DashboardCompositionHost extends HTMLElement, ReactiveControllerHost {
  readonly value: string;
  readonly sizing: 'fit' | 'fixed';
  readonly container?: 'inset' | 'flat' | 'full';
  readonly fullscreenable: boolean;
  readonly updateComplete: Promise<boolean>;
}

interface DashboardCompositionDelegate {
  getLayout(): DashboardLayout | undefined;
  getCanonicalLayout(): DashboardLayout | undefined;
  getPreview(): DashboardLayout | undefined;
  getPointerPresentation(): DashboardPointerPresentation | undefined;
  getMetrics(): DashboardMetrics | undefined;
  getLabels(): Readonly<Record<string, string>>;
  isActionAllowed(panel: DashboardPanel, action: DashboardAction): boolean;
  readonly fullscreen: DashboardFullscreenController;
  measure(): void;
  changed(catalogue: boolean): void;
}

interface DashboardPresentationSnapshot {
  layout?: DashboardLayout;
  panels: WeakMap<DashboardPanel, DashboardItem>;
  fullscreenTargetId?: string;
  metrics?: DashboardMetrics;
  value: string;
  sizing: 'fit' | 'fixed';
  width: number;
  height: number;
}

/** Presents stable panels and observes their supplied composition. */
export class DashboardCompositionController {
  readonly #host: DashboardCompositionHost;
  readonly #delegate: DashboardCompositionDelegate;
  #observer?: MutationObserver;
  #readingOrderSource?: { value: string; panels: readonly DashboardPanel[] };
  #presentedGeometry?: DashboardPresentationSnapshot;
  #ghostCorners: Record<string, string> = {};

  constructor(host: DashboardCompositionHost, delegate: DashboardCompositionDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    host.addController(this);
  }

  get ghostCorners() {
    return this.#ghostCorners;
  }

  captureCorners(panel?: DashboardPanel) {
    if (!panel || this.#delegate.getPointerPresentation()?.panel === panel) return;

    const surface = panel.shadowRoot?.querySelector('[internal-host]');
    const style = getComputedStyle(surface ?? panel);

    this.#ghostCorners = {
      borderTopLeftRadius: style.borderTopLeftRadius,
      borderTopRightRadius: style.borderTopRightRadius,
      borderBottomRightRadius: style.borderBottomRightRadius,
      borderBottomLeftRadius: style.borderBottomLeftRadius
    };
  }

  hostConnected() {
    if (isServer) return;

    void getCustomElementRegistry(this.#host)
      ?.whenDefined(DashboardPanel.metadata.tag)
      .then(() => {
        if (this.#host.isConnected) {
          this.#host.requestUpdate();
        }
      });
    this.#observer = new MutationObserver(records => {
      const catalogue = records.some(record => isDashboardCatalogueMutation(this.#host, record));
      const titles = records.some(record => isDashboardTitleMutation(this.#host, record));

      if (catalogue || titles) {
        this.#delegate.changed(catalogue);
      }
    });
    this.#observer.observe(this.#host, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'id',
        'slot',
        'hidden',
        'min-column-span',
        'max-column-span',
        'min-row-span',
        'max-row-span',
        'move-disabled',
        'resize-disabled'
      ]
    });
    this.#host.addEventListener('focusin', this.#focus);
  }

  hostDisconnected() {
    this.#observer?.disconnect();
    this.#host.removeEventListener('focusin', this.#focus);
    this.#readingOrderSource = undefined;
    this.#presentedGeometry = undefined;
  }

  get #panelElements() {
    return [...this.#host.children].filter(
      panel => matchesElementName(panel, DashboardPanel) && !panel.getAttribute('slot')
    );
  }

  get ready() {
    return this.#panelElements.length === this.ownedPanels.length;
  }

  get catalogueReady(): boolean {
    if (!this.ready) return false;

    const panels = this.ownedPanels;
    const ids = new Set(panels.map(panel => panel.id));

    return !ids.has('') && ids.size === panels.length;
  }

  get pendingPresentation() {
    if (isServer) return undefined;

    return this.catalogueReady && this.#delegate.getLayout() ? undefined : this.#presentedGeometry;
  }

  get panels(): DashboardPanel[] {
    return this.ownedPanels.filter(panel => !panel.hidden);
  }

  get hiddenPanelIds(): ReadonlySet<string> {
    return new Set(this.ownedPanels.filter(panel => panel.hidden).map(panel => panel.id));
  }

  get ownedPanels(): DashboardPanel[] {
    return this.#panelElements.filter(
      (panel): panel is DashboardPanel =>
        '_getSpanConstraints' in panel &&
        typeof panel._getSpanConstraints === 'function' &&
        '_configure' in panel &&
        typeof panel._configure === 'function' &&
        '_getLabel' in panel &&
        typeof panel._getLabel === 'function'
    );
  }

  hasPresentablePanel(id: string): boolean {
    const panels = this.panels;
    const matching = panels.filter(panel => panel.id === id);
    const previous = this.#presentedGeometry;

    if (matching.some(panel => previous?.panels.has(panel))) return true;

    return matching.length > 0 && this.catalogueReady && !!this.#delegate.getCanonicalLayout();
  }

  get viewport(): HTMLElement | undefined {
    return this.#host.shadowRoot?.querySelector<HTMLElement>('.viewport') ?? undefined;
  }

  present() {
    if (this.catalogueReady && this.#delegate.getLayout()) {
      this.#updateReadingOrder(this.panels);
      this.#presentSnapshot(this.#getPresentationSnapshot());
      return;
    }

    this.#readingOrderSource = undefined;

    if (this.#presentedGeometry) {
      this.#presentSnapshot(this.#getRetainedSnapshot(this.#presentedGeometry));
      return;
    }

    for (const panel of this.panels) {
      this.#configurePanel(panel, { placed: false });
    }
  }

  #presentSnapshot(context: DashboardPresentationSnapshot) {
    const previousFullscreen = this.#presentedGeometry?.fullscreenTargetId;
    const panels = this.panels;
    const recalibrating = this.#requiresImmediateGeometry(context);

    if (recalibrating) {
      this.#setGeometryDuration(panels, '0ms');
    }

    try {
      this.#presentPanels(panels, context);

      if (recalibrating) {
        this.#host.shadowRoot?.querySelector<HTMLElement>('.canvas')?.getBoundingClientRect();
      }

      this.#presentedGeometry = context;
    } finally {
      if (recalibrating) {
        this.#setGeometryDuration(panels);
      }
    }

    this.#revealFocusedContent(previousFullscreen, context.fullscreenTargetId);
  }

  #getRetainedSnapshot(previous: DashboardPresentationSnapshot): DashboardPresentationSnapshot {
    const { width, height } = this.#host.getBoundingClientRect();

    return {
      ...previous,
      width,
      height,
      metrics: this.#delegate.getMetrics() ?? previous.metrics,
      fullscreenTargetId: this.#delegate.fullscreen.targetPanelId
    };
  }

  #getPresentationSnapshot(): DashboardPresentationSnapshot {
    const { width, height } = this.#host.getBoundingClientRect();
    const layout = this.#delegate.getLayout();
    const metrics = this.#delegate.getMetrics();
    const panels = new WeakMap<DashboardPanel, DashboardItem>();

    for (const panel of this.panels) {
      const item = layout?.items.find(candidate => candidate.id === panel.id);
      if (item && metrics) panels.set(panel, item);
    }

    return {
      layout,
      panels,
      metrics,
      value: this.#host.value,
      sizing: this.#host.sizing,
      width,
      height,
      fullscreenTargetId: this.#delegate.fullscreen.targetPanelId
    };
  }

  #requiresImmediateGeometry(context: DashboardPresentationSnapshot): boolean {
    const previous = this.#presentedGeometry;
    if (context.fullscreenTargetId !== previous?.fullscreenTargetId) return true;

    return (
      !!previous &&
      (context.width !== previous.width || context.height !== previous.height) &&
      !haveSameGridPitch(context.metrics, previous.metrics) &&
      context.value === previous.value &&
      context.sizing === previous.sizing
    );
  }

  #setGeometryDuration(panels: readonly DashboardPanel[], duration?: string) {
    for (const panel of panels) {
      if (duration === undefined) {
        panel.style.removeProperty('--_geometry-animation-duration');
      } else {
        panel.style.setProperty('--_geometry-animation-duration', duration);
      }
    }
  }

  #presentPanels(panels: readonly DashboardPanel[], context: DashboardPresentationSnapshot) {
    const layout = this.#delegate.getPreview() ?? this.#delegate.getLayout();
    const metrics = context.metrics;

    for (const panel of panels) {
      const active =
        this.#delegate.getPointerPresentation()?.panel === panel ? this.#delegate.getPointerPresentation() : undefined;
      const item = layout ? layout.items.find(candidate => candidate.id === panel.id) : context.panels.get(panel);
      const placed = !!item && !!metrics;

      if (item && metrics) {
        this.#presentPanelGeometry({ panel, item, metrics, active });
      }

      this.#configurePanel(panel, { placed, active });
    }
  }

  #presentPanelGeometry(input: {
    panel: DashboardPanel;
    item: DashboardItem;
    metrics: DashboardMetrics;
    active?: DashboardPointerPresentation;
  }) {
    const { panel, item, metrics, active } = input;
    const box = this.#getPanelPixelPlacement(item, metrics, active);

    panel.style.setProperty('--_dashboard-inline-start', `${box.inlineStart}px`);
    Object.assign(panel.style, {
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`
    });
  }

  #getPanelPixelPlacement(
    item: DashboardLayout['items'][number],
    metrics: DashboardMetrics,
    active?: DashboardPointerPresentation
  ): DashboardPixelPlacement {
    const viewport = this.viewport;
    if (item.id === this.#delegate.fullscreen.targetPanelId && viewport) {
      return { inlineStart: 0, top: 0, width: viewport.clientWidth, height: viewport.clientHeight };
    }

    return active?.canvasPlacement ?? getDashboardPixelPlacement(item, metrics);
  }

  #updateReadingOrder(panels: readonly DashboardPanel[]) {
    const previous = this.#readingOrderSource;
    if (
      previous?.value === this.#host.value &&
      previous.panels.length === panels.length &&
      panels.every((panel, index) => panel === previous.panels[index])
    ) {
      return;
    }

    this.#readingOrderSource = { value: this.#host.value, panels };

    const layout = this.#delegate.getLayout();
    if (!layout) return;

    const entries = panels.flatMap((panel, index) => {
      const item = layout.items.find(candidate => candidate.id === panel.id);
      return item ? [{ panel, index, item }] : [];
    });

    entries.sort((a, b) => {
      const columnOrder = a.item.column - b.item.column;
      const rowOrder = a.item.row - b.item.row;

      return (layout.grid.flow === 'vertical' ? rowOrder || columnOrder : columnOrder || rowOrder) || a.index - b.index;
    });

    entries.forEach(({ panel }, rank) => panel.style.setProperty('--_reading-order', `${rank}`));
  }

  #configurePanel(panel: DashboardPanel, presentation: { placed: boolean; active?: DashboardPointerPresentation }) {
    const { placed, active } = presentation;

    if (this.#host.container && panel.getAttribute('container') !== this.#host.container) {
      panel.setAttribute('container', this.#host.container);
    } else if (!this.#host.container) {
      panel.removeAttribute('container');
    }

    const fullscreen = placed
      ? { fullscreenControl: this.#getFullscreenControl(panel.id), fullscreen: this.#getFullscreenView(panel.id) }
      : {};

    panel._configure({
      placed,
      ...this.#getPanelCapabilities(panel, placed),
      mode: active?.preview ? active.action : undefined,
      carried: !!active?.canvasPlacement,
      lifted: !!active?.canvasPlacement && active.preview,
      ...fullscreen,
      labels: this.#delegate.getLabels()
    });
  }

  #getPanelCapabilities(panel: DashboardPanel, placed: boolean) {
    if (!placed || !this.#delegate.getLayout()) return { movable: false, resizable: false };

    return {
      movable: this.#delegate.isActionAllowed(panel, 'move'),
      resizable: this.#delegate.isActionAllowed(panel, 'resize')
    };
  }

  #getFullscreenView(id: string): 'selected' | 'excluded' | undefined {
    if (!this.#delegate.fullscreen.active) return undefined;

    return this.#delegate.fullscreen.targetPanelId === id ? 'selected' : 'excluded';
  }

  #getFullscreenControl(id: string): 'enter' | 'exit' | 'unavailable' | undefined {
    if (this.#delegate.fullscreen.isSelectedPanel(id)) return 'exit';
    if (!this.#host.fullscreenable) return undefined;

    return this.#delegate.fullscreen.canEnter(id) ? 'enter' : 'unavailable';
  }

  getPanelLabel(id: string) {
    return this.panels.find(panel => panel.id === id)?._getLabel() || id;
  }

  async revealKeyboardControl(
    layout: DashboardLayout,
    control: {
      panel: DashboardPanel;
      element: HTMLElement;
      action: DashboardAction;
    }
  ) {
    await this.#host.updateComplete;

    const { panel, element, action } = control;
    if (!this.#host.isConnected || this.#delegate.getPointerPresentation()?.canvasPlacement) return;
    if (!this.panels.includes(panel) || panel.shadowRoot?.activeElement !== element) return;
    if (!this.#delegate.isActionAllowed(panel, action)) return;

    const current = this.#delegate.getCanonicalLayout();
    if (!current || serializeDashboardValue(current) !== serializeDashboardValue(layout)) return;

    this.#delegate.measure();
    this.#revealControl({ panel, control: element, action, layout: current });
  }

  #revealControl(input: {
    panel: DashboardPanel;
    control: HTMLElement;
    action: DashboardAction;
    layout: DashboardLayout;
  }) {
    const { panel, control, action, layout } = input;
    const viewport = this.viewport;
    const canvas = this.#host.shadowRoot?.querySelector<HTMLElement>('.canvas');
    const item = layout.items.find(candidate => candidate.id === panel.id);
    const metrics = this.#delegate.getMetrics();
    if (!viewport || !canvas || !item || !metrics) {
      return;
    }

    const origin = canvas.getBoundingClientRect();
    const target = getDashboardPixelPlacement(item, metrics);
    const rect = getProjectedControlRect(
      {
        control: getDashboardClientRect(control),
        current: getDashboardClientRect(panel),
        target: getDashboardPlacementClientRect(
          target,
          { x: origin.left, y: origin.top, width: origin.width, height: origin.height },
          this.#host.matches(':dir(rtl)') ? 'rtl' : 'ltr'
        )
      },
      {
        right: action === 'resize' ? !panel.matches(':dir(rtl)') : panel.matches(':dir(rtl)'),
        bottom: action === 'resize'
      }
    );

    this.#scrollViewportTo(rect);
  }

  #revealFocusedContent(previousTargetId: string | undefined, targetId: string | undefined) {
    if (!previousTargetId || targetId) return;

    const active = getActiveElement(this.#host.ownerDocument);
    if (
      !(active instanceof HTMLElement) ||
      !active.isConnected ||
      !this.panels.some(panel => panel.matches(':focus-within'))
    ) {
      return;
    }

    this.#scrollViewportTo(getDashboardClientRect(active));
  }

  #scrollViewportTo(rect: Rect) {
    const viewport = this.viewport;
    if (!viewport) return;

    const bounds = viewport.getBoundingClientRect();
    const delta = getRevealScrollDelta(rect, {
      x: bounds.left,
      y: bounds.top,
      width: viewport.clientWidth,
      height: viewport.clientHeight
    });

    viewport.scrollBy(delta.x, delta.y);
  }

  #focus = (event: FocusEvent) => {
    if (this.#delegate.getPointerPresentation()?.canvasPlacement) return;

    const path = event.composedPath();
    if (!path.some(node => node instanceof HTMLElement && this.panels.some(panel => panel === node))) {
      return;
    }

    path
      .find((node): node is HTMLElement => node instanceof HTMLElement)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
}
