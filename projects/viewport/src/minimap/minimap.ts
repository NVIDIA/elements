// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing, svg } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import {
  GestureController,
  attachInternals,
  hostAttr,
  isImmediateRootActiveElement,
  type Gesture,
  type GestureInput,
  type PointerEndGesture,
  type PointerMovementGesture,
  type WheelGestureInput,
  useStyles
} from '@nvidia-elements/core/internal';
import styles from './minimap.css?inline';
import {
  createViewportMinimapProjection,
  projectViewportMinimapRect,
  unprojectViewportMinimapPoint,
  type ViewportMinimapProjection
} from './minimap.utils.js';
import { anchoredTransform } from '../viewport/viewport-projection.utils.js';
import { Viewport } from '@nvidia-elements/viewport/viewport';
import type {
  ViewportPanEndRequest,
  ViewportPanUpdateProposal,
  ViewportPanSession,
  ViewportRect,
  ViewportTransform
} from '@nvidia-elements/viewport/viewport';

const DRAG_THRESHOLD = 3;

interface MinimapPointerSession {
  readonly pointerId: number;
  readonly dragProjection: ViewportMinimapProjection;
  readonly indicator: boolean;
  active: boolean;
  activating: boolean;
  navigation?: ViewportPanSession;
  pendingEnd?: ViewportPanEndRequest;
  exceededThreshold: boolean;
  transformStart: ViewportTransform;
  transformStartDisplacementX: number;
  transformStartDisplacementY: number;
  lastTotalDisplacementX: number;
  lastTotalDisplacementY: number;
}

interface ProjectionUpdate {
  readonly measureRoots: boolean;
}

interface AutomaticPreviewItem extends ViewportRect {
  readonly id: string;
}

/**
 * @element nve-viewport-minimap
 * @description Provides a simplified overview and direct navigation for its parent viewport.
 * @documentation https://nvidia.github.io/elements/docs/viewport/minimap/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/viewport/minimap
 * @cssprop --background - Color of the surface behind preview geometry.
 * @cssprop --color - Color of automatically drawn root rectangles.
 * @cssprop --indicator-color - Color of the current visible-region indicator.
 * @cssprop --border-radius - Corner radius of the minimap.
 * @cssprop --recenter-cursor - Cursor for clicking the background to center the viewport.
 * @cssprop --pan-cursor - Cursor over a draggable visible region.
 * @cssprop --panning-cursor - Cursor during a visible-region drag.
 * @slot preview - Optional simplified content drawn in viewport content coordinates. Replaces automatic root rectangles.
 */
export class ViewportMinimap extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-viewport-minimap',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  /** @private */
  @hostAttr() slot = 'overlay';

  /** @private */
  @hostAttr({ attribute: 'aria-hidden' }) protected accessibilityHidden = 'true';

  readonly #gestureController: GestureController;
  readonly #rootKeys = new WeakMap<Element, string>();
  #nextRootKey = 0;
  #viewport?: Viewport;
  #defaultSlot?: HTMLSlotElement;
  #layoutResizeObserver?: ResizeObserver;
  #rootResizeObserver?: ResizeObserver;
  #contentBounds: readonly ViewportRect[] = [];
  #automaticItems: readonly AutomaticPreviewItem[] = [];
  #projection?: ViewportMinimapProjection;
  #pointerSession?: MinimapPointerSession;
  #animationFrame?: number;
  #measureRootsOnFrame = false;

  get #previewRoots(): Element[] {
    return Array.from(this.children).filter(child => child.slot === 'preview');
  }

  get #viewportRoots(): Element[] {
    const viewport = this.#viewport;
    if (!viewport) return [];
    return Array.from(viewport.children).filter(child => !child.slot);
  }

  constructor() {
    super();
    this.#gestureController = new GestureController(this, {
      claimPriority: 'self-first',
      suppressNativeDrag: true,
      touchAction: () => (this.#pointerSession || this.#viewport?.pannable ? 'none' : undefined)
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    attachInternals(this);
    const viewport = this.parentElement;
    if (!(viewport instanceof Viewport)) return;
    this.#viewport = viewport;
    this.#viewport.addEventListener('viewportchange', this.#handleTransformCommitted);
    this.#viewport.addEventListener('capabilitieschange', this.#handleCapabilitiesChange);
    this.#connectViewport(viewport);
    this.requestUpdate();
  }

  #connectViewport(viewport: Viewport): void {
    this.#gestureController.target = this;
    this.addEventListener('nve-gesture-input', this.#handleGestureInput as EventListener);
    this.addEventListener('nve-gesture', this.#handleGesture as EventListener);
    this.#connectResizeObservers();
    void viewport.updateComplete.then(() => {
      if (this.#viewport !== viewport) return;
      this.#defaultSlot = viewport.shadowRoot?.querySelector('slot:not([name])') ?? undefined;
      this.#defaultSlot?.addEventListener('slotchange', this.#handleSlotChange);
      this.#syncObservedRoots();
      this.#scheduleProjectionUpdate({ measureRoots: true });
    });
  }

  disconnectedCallback(): void {
    this.#interruptPointerSession();
    this.#viewport?.removeEventListener('viewportchange', this.#handleTransformCommitted);
    this.#viewport?.removeEventListener('capabilitieschange', this.#handleCapabilitiesChange);
    this.#disconnectViewport();
    this.#disconnectObservers();
    this.#resetConnectionState();
    super.disconnectedCallback();
  }

  #disconnectViewport(): void {
    this.removeEventListener('nve-gesture-input', this.#handleGestureInput as EventListener);
    this.removeEventListener('nve-gesture', this.#handleGesture as EventListener);
    this.#defaultSlot?.removeEventListener('slotchange', this.#handleSlotChange);
  }

  #disconnectObservers(): void {
    this.#layoutResizeObserver?.disconnect();
    this.#rootResizeObserver?.disconnect();
    if (this.#animationFrame !== undefined) cancelAnimationFrame(this.#animationFrame);
  }

  #resetConnectionState(): void {
    this.#animationFrame = undefined;
    this.#measureRootsOnFrame = false;
    this.#gestureController.target = undefined;
    this.#pointerSession = undefined;
    this.#viewport = undefined;
    this.#defaultSlot = undefined;
    this.#projection = undefined;
    this.#contentBounds = [];
    this.#automaticItems = [];
    this._internals.states.delete('pan-eligible');
    this._internals.states.delete('panning');
  }

  /** Remeasures content bounds after preview or viewport roots move without resizing. */
  refresh(): void {
    this.#scheduleProjectionUpdate({ measureRoots: true });
  }

  render() {
    const projection = this.#projection;
    const viewport = this.#viewport;
    const visible =
      viewport && projection ? projectViewportMinimapRect(viewport.getVisibleRect(), projection) : undefined;
    return html`
      <div internal-host class="surface">
        ${this.#renderBackground()}
        ${this.#renderPreview(projection)}
        ${this.#renderForeground(projection, visible)}
      </div>
    `;
  }

  #renderBackground() {
    return html`<svg class="background-layer" aria-hidden="true" focusable="false">
      <rect class="background" data-minimap-background width="100%" height="100%"></rect>
    </svg>`;
  }

  #renderPreview(projection?: ViewportMinimapProjection) {
    return html`<div
      class="preview"
      style=${styleMap({
        transform: projection
          ? `translate(${projection.offsetX}px, ${projection.offsetY}px) scale(${projection.scale})`
          : 'none'
      })}
    >
      <slot name="preview" @slotchange=${this.#handleSlotChange}></slot>
    </div>`;
  }

  #renderForeground(projection?: ViewportMinimapProjection, visible?: ViewportRect) {
    return html`<svg
      class="foreground-layer"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 ${this.clientWidth} ${this.clientHeight}"
      preserveAspectRatio="none"
    >
      ${this.#renderAutomaticItems(projection)}
      ${this.#renderVisibleRegion(visible)}
    </svg>`;
  }

  #renderAutomaticItems(projection?: ViewportMinimapProjection) {
    if (!projection || this.#previewRoots.length) return nothing;
    return this.#automaticItems.map(item => this.#renderItem(item, projection));
  }

  #renderVisibleRegion(visible?: ViewportRect) {
    if (!visible) return nothing;
    return svg`<rect
      class="visible-region"
      data-visible-region
      x=${visible.x}
      y=${visible.y}
      width=${visible.width}
      height=${visible.height}
      rx="2"
    ></rect>`;
  }

  #renderItem(item: AutomaticPreviewItem, projection: ViewportMinimapProjection) {
    const rect = projectViewportMinimapRect(item, projection);
    return svg`<rect
      class="item"
      data-item-key=${item.id}
      x=${rect.x}
      y=${rect.y}
      width=${rect.width}
      height=${rect.height}
      rx="2"
    ></rect>`;
  }

  #connectResizeObservers(): void {
    const viewport = this.#viewport;
    if (!viewport || typeof ResizeObserver === 'undefined') return;
    this.#layoutResizeObserver = new ResizeObserver(entries => {
      this.#scheduleProjectionUpdate({
        measureRoots: entries.some(entry => entry.target === viewport || entry.target === this)
      });
    });
    this.#layoutResizeObserver.observe(viewport);
    this.#layoutResizeObserver.observe(this);
    this.#rootResizeObserver = new ResizeObserver(() => this.#scheduleProjectionUpdate({ measureRoots: true }));
  }

  #handleSlotChange = (): void => {
    this.#syncObservedRoots();
    this.#scheduleProjectionUpdate({ measureRoots: true });
  };

  #syncObservedRoots(): void {
    const viewport = this.#viewport;
    this.#rootResizeObserver?.disconnect();
    if (!viewport) return;
    const previewRoots = this.#previewRoots;
    const roots = previewRoots.length ? previewRoots : this.#viewportRoots;
    for (const root of roots) this.#rootResizeObserver?.observe(root);
  }

  #handleTransformCommitted = (): void => {
    const transform = this.#viewport?.getTransform();
    const session = this.#pointerSession;
    if (session?.active && transform) {
      session.transformStart = transform;
      session.transformStartDisplacementX = session.lastTotalDisplacementX;
      session.transformStartDisplacementY = session.lastTotalDisplacementY;
    }
    this.#scheduleProjectionUpdate({ measureRoots: false });
  };

  #handleCapabilitiesChange = (): void => {
    this.#syncPanEligibleState();
    this.requestUpdate();
  };

  #syncPanEligibleState(): void {
    const eligible = Boolean(this.#viewport?.pannable && this.#projection);
    if (this._internals.states.has('pan-eligible') === eligible) return;
    if (eligible) this._internals.states.add('pan-eligible');
    else this._internals.states.delete('pan-eligible');
  }

  #scheduleProjectionUpdate({ measureRoots }: ProjectionUpdate): void {
    this.#measureRootsOnFrame ||= measureRoots;
    if (this.#animationFrame !== undefined) return;
    this.#animationFrame = requestAnimationFrame(() => {
      this.#animationFrame = undefined;
      const shouldMeasureRoots = this.#measureRootsOnFrame;
      this.#measureRootsOnFrame = false;
      this.#updateProjection({ measureRoots: shouldMeasureRoots });
    });
  }

  #updateProjection({ measureRoots }: ProjectionUpdate): void {
    const viewport = this.#viewport;
    if (!viewport) return;
    if (measureRoots) {
      const previewRoots = this.#previewRoots;
      if (previewRoots.length) {
        this.#automaticItems = [];
        this.#contentBounds = this.#measureCustomContent(previewRoots);
      } else {
        this.#automaticItems = this.#measureAutomaticItems(viewport, this.#viewportRoots);
        this.#contentBounds = this.#automaticItems;
      }
    }
    this.#projection = createViewportMinimapProjection(this.#contentBounds, viewport.getVisibleRect(), {
      height: this.clientHeight,
      width: this.clientWidth
    });
    this.#syncPanEligibleState();
    this.requestUpdate();
  }

  #measureCustomContent(roots: readonly Element[]): readonly ViewportRect[] {
    const wrapper = this.renderRoot.querySelector<HTMLElement>('.preview');
    if (!wrapper) return [];
    const frame = wrapper.getBoundingClientRect();
    const transform = getComputedStyle(wrapper).transform;
    const matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform);
    const bounds: ViewportRect[] = [];
    for (const root of roots) {
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      bounds.push({
        x: (rect.left - frame.left) / matrix.m11,
        y: (rect.top - frame.top) / matrix.m11,
        width: rect.width / matrix.m11,
        height: rect.height / matrix.m11
      });
    }
    return bounds;
  }

  #measureAutomaticItems(viewport: Viewport, roots: readonly Element[]): readonly AutomaticPreviewItem[] {
    const frame = viewport.getBoundingClientRect();
    const transform = viewport.getTransform();
    const items: AutomaticPreviewItem[] = [];
    for (const root of roots) {
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      items.push({
        id: this.#keyForRoot(root),
        x: transform.x + (rect.left - frame.left) / transform.scale,
        y: transform.y + (rect.top - frame.top) / transform.scale,
        width: rect.width / transform.scale,
        height: rect.height / transform.scale
      });
    }
    return items;
  }

  #keyForRoot(root: Element): string {
    const id = root.id.trim();
    if (id) return id;
    const current = this.#rootKeys.get(root);
    if (current) return current;
    const key = `root-${this.#nextRootKey}`;
    this.#nextRootKey += 1;
    this.#rootKeys.set(root, key);
    return key;
  }

  #handleGestureInput = (event: CustomEvent<GestureInput>): void => {
    const input = event.detail;
    if (input.kind === 'pointerdown') this.#handlePointerDown(input);
    else if (input.kind === 'pointerend') this.#handlePointerEnd(input);
    else this.#handleWheel(input);
  };

  #handleWheel(input: WheelGestureInput): void {
    const viewport = this.#viewport;
    if (
      input.deltaY === 0 ||
      !viewport ||
      !viewport.zoomable ||
      !isImmediateRootActiveElement(viewport) ||
      !input.claim()
    ) {
      return;
    }
    const start = viewport.getTransform();
    const visible = viewport.getVisibleRect();
    const anchor = { x: visible.x + visible.width / 2, y: visible.y + visible.height / 2 };
    const factor = this.#gestureController.getWheelZoomFactor(input);
    const viewportCenter = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
    viewport.requestZoom({
      anchor,
      event: input.event,
      factor,
      next: anchoredTransform(
        anchor,
        viewportCenter,
        Math.min(viewport.maxScale, Math.max(viewport.minScale, start.scale * factor))
      ),
      source: 'minimap'
    });
  }

  #handlePointerDown(input: Extract<GestureInput, { kind: 'pointerdown' }>): void {
    const nativeEvent = input.event;
    const viewport = this.#viewport;
    const projection = this.#projection;
    if (!viewport || nativeEvent.button !== 0 || !nativeEvent.isPrimary || (!viewport.pannable && !viewport.zoomable)) {
      return;
    }
    viewport.focus({ preventScroll: true });
    if (!projection || !viewport.pannable || !input.claim({ kind: 'drag' })) return;
    const start = viewport.getTransform();
    const indicator = nativeEvent
      .composedPath()
      .some(target => target instanceof Element && target.hasAttribute('data-visible-region'));
    this.#pointerSession = {
      active: false,
      activating: false,
      exceededThreshold: false,
      indicator,
      lastTotalDisplacementX: 0,
      lastTotalDisplacementY: 0,
      pointerId: nativeEvent.pointerId,
      dragProjection: projection,
      transformStart: start,
      transformStartDisplacementX: 0,
      transformStartDisplacementY: 0
    };
  }

  #handleGesture = (event: CustomEvent<Gesture<undefined>>): void => {
    const gesture = event.detail;
    if (gesture.kind === 'drag') this.#handlePointerDrag(gesture);
  };

  #handlePointerDrag(gesture: PointerMovementGesture): void {
    const session = this.#pointerSession;
    if (!session || session.pointerId !== gesture.event.pointerId) return;
    session.lastTotalDisplacementX = gesture.totalDisplacementX;
    session.lastTotalDisplacementY = gesture.totalDisplacementY;
    const distanceSquared = gesture.totalDisplacementX ** 2 + gesture.totalDisplacementY ** 2;
    if (distanceSquared < DRAG_THRESHOLD ** 2) return;
    session.exceededThreshold = true;
    if (!session.indicator) return;
    const proposal = this.#dragProposal(gesture, session);
    if (!session.active) this.#activateDrag(session, proposal);
    else session.navigation?.update(proposal);
  }

  #activateDrag(session: MinimapPointerSession, proposal: ViewportPanUpdateProposal): void {
    session.activating = true;
    const navigation = this.#viewport?.startPan({ ...proposal, source: 'minimap' });
    session.activating = false;
    if (!navigation) return;
    if (this.#pointerSession !== session) {
      if (session.pendingEnd) navigation.end(session.pendingEnd);
      return;
    }
    session.navigation = navigation;
    session.active = true;
    this._internals.states.add('panning');
  }

  #dragProposal(gesture: PointerMovementGesture, session: MinimapPointerSession): ViewportPanUpdateProposal {
    const displacementX = gesture.totalDisplacementX - session.transformStartDisplacementX;
    const displacementY = gesture.totalDisplacementY - session.transformStartDisplacementY;
    return {
      clientX: gesture.clientX,
      clientY: gesture.clientY,
      event: gesture.event,
      next: {
        scale: session.transformStart.scale,
        x: session.transformStart.x + displacementX / session.dragProjection.scale,
        y: session.transformStart.y + displacementY / session.dragProjection.scale
      }
    };
  }

  #handlePointerEnd(input: PointerEndGesture): void {
    const session = this.#pointerSession;
    if (!session || session.pointerId !== input.event.pointerId) return;
    session.lastTotalDisplacementX = input.totalDisplacementX;
    session.lastTotalDisplacementY = input.totalDisplacementY;
    if (session.active) {
      session.navigation?.end({ event: input.event, interrupted: input.interrupted, reason: input.reason });
    } else if (session.activating) {
      session.pendingEnd = { event: input.event, interrupted: input.interrupted, reason: input.reason };
    } else if (input.reason === 'up' && !session.exceededThreshold) {
      this.#requestClickPan(input.event, session);
    }
    this.#endPointerSession(session);
  }

  #requestClickPan(event: PointerEvent, session: MinimapPointerSession): void {
    const viewport = this.#viewport;
    if (!viewport) return;
    const frame = this.getBoundingClientRect();
    const point = unprojectViewportMinimapPoint(
      { x: event.clientX - frame.left, y: event.clientY - frame.top },
      session.dragProjection
    );
    const current = viewport.getTransform();
    const visible = viewport.getVisibleRect();
    viewport.requestPan({
      clientX: event.clientX,
      clientY: event.clientY,
      event,
      next: {
        scale: current.scale,
        x: point.x - visible.width / 2,
        y: point.y - visible.height / 2
      },
      source: 'minimap'
    });
  }

  #endPointerSession(session: MinimapPointerSession): void {
    if (this.#pointerSession !== session) return;
    this.#pointerSession = undefined;
    this._internals.states.delete('panning');
    this.requestUpdate();
  }

  #interruptPointerSession(): void {
    const session = this.#pointerSession;
    if (!session) return;
    this.#endPointerSession(session);
    const end: ViewportPanEndRequest = { event: new Event('disconnect'), interrupted: true, reason: 'cancel' };
    if (session.active) session.navigation?.end(end);
    else if (session.activating) session.pendingEnd = end;
  }
}
