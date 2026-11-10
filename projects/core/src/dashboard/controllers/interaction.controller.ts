// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

import {
  type Gesture,
  GestureController,
  type GestureInput,
  matchesElementName,
  type PointerDownInput,
  type PointerEndGesture
} from '@nvidia-elements/core/internal';

import { getAnchoredResizeGeometry, getDashboardResizeCorner, isDashboardResizeEdge } from '../utils/geometry.utils.js';
import { serializeDashboardValue } from '../utils/layout.utils.js';

import { DashboardPanel } from '../panel/panel.js';

import type {
  DashboardMetrics,
  DashboardPixelPlacement,
  DashboardReadingDirection,
  DashboardResizeEdge
} from '../utils/geometry.utils.js';
import type { DashboardAction, DashboardGridGeometry, DashboardPointerIntent } from '../utils/intent.types.js';
import type { DashboardMovementRequest } from '../utils/movement.utils.js';

import type { DashboardGridPlacement, DashboardItem, DashboardLayout } from '../dashboard.types.js';

/** Display state for a pointer interaction, including press and placement preview. */
export interface DashboardPointerPresentation {
  readonly panel: DashboardPanel;
  readonly action: DashboardAction;
  readonly preview: boolean;
  readonly canvasPlacement?: DashboardPixelPlacement;
  readonly rejected?: boolean;
  readonly initialPlacement?: DashboardGridPlacement;
  readonly start?: boolean;
}

interface DashboardInteractionControl {
  panel: DashboardPanel;
  action: string;
  element: HTMLElement;
  edge?: DashboardResizeEdge;
}

/** Immutable starting geometry and the latest proposal for one pointer interaction. */
interface PointerArrangementState {
  readonly panel: DashboardPanel;
  readonly initialLayout: DashboardLayout;
  readonly initialMetrics: DashboardMetrics;
  readonly control: HTMLElement;
  readonly stateKey: string;
  readonly readingDirection: DashboardReadingDirection;
  intent?: DashboardPointerIntent;
  proposed?: DashboardLayout;
  pointer?: {
    id: number;
    x: number;
    y: number;
    grabX: number;
    grabY: number;
    currentX: number;
    currentY: number;
    moved: boolean;
    initialPixelPlacement: DashboardPixelPlacement;
    scrollTargets: readonly Node[];
  };
}

type PointerArrangementAction =
  | { readonly action: 'move' }
  | { readonly action: 'resize'; readonly edge: DashboardResizeEdge };

type PointerArrangementSession = PointerArrangementState & PointerArrangementAction;

interface DashboardInteractionDelegate {
  getLayout(): DashboardLayout | undefined;
  getArrangementStateKey(): string;
  getMetrics(): DashboardMetrics | undefined;
  getViewport(): HTMLElement | undefined;
  isActionAllowed(panel: DashboardPanel, action: DashboardAction): boolean;
  findPointerProposal(
    layout: DashboardLayout,
    request: {
      readonly id: string;
      readonly intent: DashboardPointerIntent;
    }
  ): DashboardLayout | undefined;
  findCommandProposal(
    layout: DashboardLayout,
    id: string,
    request: { readonly command: string; readonly placement?: DashboardGridPlacement }
  ): DashboardLayout | undefined;
  getMovementTarget(layout: DashboardLayout, request: DashboardMovementRequest): DashboardGridPlacement | undefined;
  present(layout: DashboardLayout | undefined, presentation?: DashboardPointerPresentation): void;
  commit(layout: DashboardLayout): boolean;
  reveal(layout: DashboardLayout, control: DashboardInteractionControl & { action: DashboardAction }): void;
  announce(id: string, geometry: DashboardGridPlacement, valid: boolean): void;
}

const keyCommands: Readonly<Record<string, Record<DashboardAction, string>>> = {
  Home: { move: '--move-to-start', resize: '' },
  ArrowLeft: { move: '--move-left', resize: '--decrease-width' },
  ArrowRight: { move: '--move-right', resize: '--increase-width' },
  ArrowUp: { move: '--move-up', resize: '--decrease-height' },
  ArrowDown: { move: '--move-down', resize: '--increase-height' }
};

/** Owns pointer arrangement and immediate keyboard placement. */
export class DashboardInteractionController {
  readonly #host: HTMLElement & ReactiveControllerHost;
  readonly #delegate: DashboardInteractionDelegate;
  #session?: PointerArrangementSession;
  #frame?: number;

  constructor(host: HTMLElement & ReactiveControllerHost, delegate: DashboardInteractionDelegate) {
    this.#host = host;
    this.#delegate = delegate;

    const gesture = new GestureController(host, {
      claimPriority: 'descendant-first',
      suppressNativeDrag: true,
      shouldIgnoreEvent: event => !this.#findControl(event)
    });

    gesture.target = host;
    host.addController(this);
  }

  hostConnected() {
    this.#host.addEventListener('nve-gesture-input', this.#input as EventListener);
    this.#host.addEventListener('nve-gesture', this.#movement as EventListener);
    this.#host.addEventListener('click', this.#click, true);
    this.#host.addEventListener('keydown', this.#keydown);
  }

  hostDisconnected() {
    this.cancel();
    this.#host.removeEventListener('nve-gesture-input', this.#input as EventListener);
    this.#host.removeEventListener('nve-gesture', this.#movement as EventListener);
    this.#host.removeEventListener('click', this.#click, true);
    this.#host.removeEventListener('keydown', this.#keydown);
  }

  cancel() {
    this.#finish(false);
  }

  #findControl(event: Event) {
    const path = event.composedPath();
    const panel = path.find(
      (node): node is DashboardPanel =>
        node instanceof HTMLElement && matchesElementName(node, DashboardPanel) && node.parentElement === this.#host
    );
    if (!panel) return undefined;

    const element = path.find(
      (node): node is HTMLElement =>
        node instanceof HTMLElement && node.getRootNode() === panel.shadowRoot && !!node.dataset.dashboardAction
    );
    if (!element) return undefined;

    const edge = element.dataset.dashboardEdge;
    if (!isDashboardResizeEdge(edge)) return { panel, element, action: element.dataset.dashboardAction ?? '' };

    const grip = panel.shadowRoot?.querySelector<HTMLElement>(
      '[data-dashboard-action="resize"]:not([data-dashboard-edge])'
    );

    return grip ? { panel, element: grip, action: 'resize', edge } : undefined;
  }

  #begin(control: DashboardInteractionControl, action: DashboardAction): boolean {
    if (this.#session || !this.#owns(control)) return false;

    const layout = this.#delegate.getLayout();
    const metrics = this.#delegate.getMetrics();
    const source = layout?.items.find(item => item.id === control.panel.id);
    if (!layout || !metrics || !source || !this.#delegate.isActionAllowed(control.panel, action)) {
      return false;
    }

    this.#session = {
      panel: control.panel,
      ...getPointerArrangementAction(control, action),
      initialLayout: layout,
      initialMetrics: metrics,
      control: control.element,
      stateKey: this.#delegate.getArrangementStateKey(),
      readingDirection: this.#host.matches(':dir(rtl)') ? 'rtl' : 'ltr',
      proposed: layout
    };

    return true;
  }

  #owns(control: DashboardInteractionControl) {
    return (
      this.#host.isConnected &&
      control.panel.parentElement === this.#host &&
      !control.panel.hidden &&
      !control.panel.slot &&
      control.element.getRootNode() === control.panel.shadowRoot
    );
  }

  #finish(commit: boolean) {
    const session = this.#session;
    if (!session) return;

    this.#session = undefined;

    if (this.#frame !== undefined) {
      cancelAnimationFrame(this.#frame);
    }

    this.#frame = undefined;
    this.#endPointerTracking(session);
    this.#delegate.present(undefined);

    const admitted = commit ? this.#admit(session) : undefined;

    if (admitted) {
      this.#delegate.commit(admitted);
    }
  }

  #admit(session: PointerArrangementSession): DashboardLayout | undefined {
    if (
      session.stateKey !== this.#delegate.getArrangementStateKey() ||
      !session.proposed ||
      !this.#owns({
        panel: session.panel,
        element: session.control,
        action: session.action
      }) ||
      !this.#delegate.isActionAllowed(session.panel, session.action)
    ) {
      return undefined;
    }

    const admitted = this.#propose(session);

    return admitted && serializeDashboardValue(admitted) === serializeDashboardValue(session.proposed)
      ? admitted
      : undefined;
  }

  #propose(session: PointerArrangementSession) {
    return session.intent
      ? this.#delegate.findPointerProposal(session.initialLayout, {
          id: session.panel.id,
          intent: session.intent
        })
      : session.initialLayout;
  }

  #preview(intent: DashboardPointerIntent, canvasPlacement?: DashboardPixelPlacement) {
    const session = this.#session;
    if (!session) return;

    const geometry = intent.geometry;
    const target =
      intent.kind === 'anchored-resize'
        ? geometry
        : this.#delegate.getMovementTarget(session.initialLayout, {
            id: session.panel.id,
            geometry
          });

    session.intent = { ...intent, geometry: target ?? geometry };

    const proposed = target && this.#propose(session);

    session.proposed = proposed;

    const start = intent.kind === 'start';

    this.#delegate.present(proposed ?? session.initialLayout, {
      panel: session.panel,
      action: session.action,
      preview: true,
      rejected: !proposed,
      start,
      initialPlacement: session.initialLayout.items.find(item => item.id === session.panel.id),
      canvasPlacement
    });

    const actual = session.proposed?.items.find(item => item.id === session.panel.id);

    this.#delegate.announce(session.panel.id, actual ?? geometry, !!proposed);
  }

  #click = (event: MouseEvent) => {
    const control = this.#findControl(event);
    if (!control) return;

    event.preventDefault();
    event.stopImmediatePropagation();
  };

  #keydown = (event: KeyboardEvent) => {
    const control = this.#findControl(event);
    if (!control) return;

    control.element.removeAttribute('data-pointer-focus');

    if (this.#session?.pointer) {
      this.#handlePointerKey(event);
      return;
    }

    const { action } = control;
    if (!isDashboardAction(action)) return;

    const command = getKeyboardCommand(event.key, action, getDashboardResizeCorner(control.panel) === 'bottom-left');
    if (!command || !this.#owns(control) || !this.#delegate.isActionAllowed(control.panel, action)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const admitted: DashboardInteractionControl & { action: DashboardAction } = { ...control, action };

    if (!this.#moveAcrossGrowthStart(event, admitted)) this.#applyKeyboardStep(admitted, command);
  };

  #moveAcrossGrowthStart(
    event: KeyboardEvent,
    control: DashboardInteractionControl & { action: DashboardAction }
  ): boolean {
    if (control.action !== 'move' || !hasOnlyShiftModifier(event)) return false;

    const layout = this.#delegate.getLayout();
    if (!layout) return false;

    const source = layout.items.find(item => item.id === control.panel.id);
    if (!source) return false;

    const boundedAxis = layout.grid.flow === 'vertical' ? 'column' : 'row';
    const step = getBoundedAxisStartStep(event.key, boundedAxis, this.#host.matches(':dir(rtl)'));
    if (!step) return false;

    const size = boundedAxis === 'column' ? 'columnSpan' : 'rowSpan';
    const coordinate = source[boundedAxis] + step;

    if (coordinate < 0 || coordinate + source[size] > layout.grid.tracks) {
      this.#delegate.announce(source.id, source, false);
    } else {
      this.#applyKeyboardStep(control, '--move-to-start', { ...source, [boundedAxis]: coordinate });
    }

    return true;
  }

  #handlePointerKey(event: KeyboardEvent) {
    if (event.key !== 'Escape' && event.key !== 'Enter') return;

    event.preventDefault();
    event.stopPropagation();
    this.#finish(event.key === 'Enter');
  }

  #applyKeyboardStep(
    control: DashboardInteractionControl & { action: DashboardAction },
    command: string,
    placement?: DashboardGridPlacement
  ) {
    const layout = this.#delegate.getLayout();
    const source = layout?.items.find(item => item.id === control.panel.id);
    if (!layout || !source) return;

    const proposed = this.#delegate.findCommandProposal(layout, source.id, { command, placement });
    const actual = proposed?.items.find(item => item.id === source.id);

    this.#delegate.announce(source.id, actual ?? source, !!actual);

    const expected = proposed && this.#delegate.commit(proposed) ? proposed : layout;

    this.#delegate.reveal(expected, control);
  }

  #input = (event: CustomEvent<GestureInput>) => {
    if (event.target !== this.#host) return;

    const input = event.detail;

    if (input.kind === 'pointerdown') {
      this.#handlePointerDown(input);
    } else if (input.kind === 'pointerend') {
      this.#handlePointerEnd(input);
    }
  };

  #movement = (event: CustomEvent<Gesture<undefined>>) => {
    if (event.target !== this.#host || event.detail.kind !== 'drag') return;

    this.#pointerMove(event.detail.event);
  };

  #handlePointerDown(input: PointerDownInput) {
    const event = input.event;
    if (this.#session?.pointer) return;

    const control = this.#findPointerControl(event);
    if (!control) return;
    if (!this.#begin(control, control.action)) return;

    const session = this.#session;
    const viewport = this.#delegate.getViewport();

    if (!session || !viewport || !input.claim({ kind: 'drag' })) {
      this.cancel();
      return;
    }

    this.#beginPointerTracking({ event, session, viewport });
  }

  #findPointerControl(event: PointerEvent): (DashboardInteractionControl & { action: DashboardAction }) | undefined {
    if (event.button !== 0 || !event.isPrimary) return undefined;

    const control = this.#findControl(event);
    if (!control) return undefined;
    if (control.edge && event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
      return undefined;
    }

    const { action } = control;

    return isDashboardAction(action) ? { ...control, action } : undefined;
  }

  #beginPointerTracking(input: { event: PointerEvent; session: PointerArrangementSession; viewport: HTMLElement }) {
    const { event, session, viewport } = input;
    const canvas = viewport.querySelector<HTMLElement>('.canvas');
    if (!canvas) return;

    const geometry = this.#measurePointerOrigin(session.panel, canvas, event);

    session.pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      moved: false,
      scrollTargets: getScrollAncestors(viewport),
      ...geometry
    };
    this.#delegate.present(session.initialLayout, {
      panel: session.panel,
      action: session.action,
      preview: false,
      canvasPlacement: geometry.initialPixelPlacement
    });
    event.preventDefault();
    session.control.setAttribute('data-pointer-focus', '');
    session.control.focus({ preventScroll: true });
    if (this.#session !== session || !session.pointer) return;

    for (const target of session.pointer.scrollTargets) {
      target.addEventListener('scroll', this.#scroll, { passive: true });
    }
  }

  #measurePointerOrigin(panel: DashboardPanel, canvas: HTMLElement, event: PointerEvent) {
    const canvasClientRect = canvas.getBoundingClientRect();
    const visual = panel.getBoundingClientRect();
    const readingDirection = this.#host.matches(':dir(rtl)') ? 'rtl' : 'ltr';

    return {
      initialPixelPlacement: {
        inlineStart: getInlineOffset(
          readingDirection === 'rtl' ? visual.right : visual.left,
          canvasClientRect,
          readingDirection
        ),
        top: visual.top - canvasClientRect.top,
        width: visual.width,
        height: visual.height
      },
      grabX: getInlineOffset(event.clientX, visual, readingDirection),
      grabY: event.clientY - visual.top
    };
  }

  #pointerMove = (event: PointerEvent) => {
    const pointer = this.#session?.pointer;
    if (!pointer || event.pointerId !== pointer.id) return;

    pointer.currentX = event.clientX;
    pointer.currentY = event.clientY;
    pointer.moved ||= Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) >= 3;
    if (!pointer.moved) return;

    event.preventDefault();
    this.#updatePointer();
    this.#scheduleScroll();
  };

  #updatePointer() {
    const session = this.#session;
    const pointer = session?.pointer;
    const viewport = this.#delegate.getViewport();
    const canvas = viewport?.querySelector<HTMLElement>('.canvas');
    if (!session || !pointer || !viewport || !canvas) {
      return;
    }

    if (session.stateKey !== this.#delegate.getArrangementStateKey()) {
      this.cancel();
      return;
    }

    const source = session.initialLayout.items.find(item => item.id === session.panel.id);
    if (!source) return;

    const sample = { session, pointer, viewport, source, canvasClientRect: canvas.getBoundingClientRect() };
    const geometry = getPointerGeometry(sample);

    this.#preview(createPointerIntent(sample, geometry.geometry), geometry.canvasPlacement);
  }

  #scheduleScroll() {
    if (this.#frame !== undefined) return;

    this.#frame = requestAnimationFrame(() => this.#scrollFrame());
  }

  #scrollFrame() {
    this.#frame = undefined;

    const pointer = this.#session?.pointer;
    const viewport = this.#delegate.getViewport();
    if (!pointer?.moved || !viewport) return;

    const bounds = viewport.getBoundingClientRect();
    const dx = getEdgeScrollSpeed(pointer.currentX, bounds.left, bounds.right);
    const dy = getEdgeScrollSpeed(pointer.currentY, bounds.top, bounds.bottom);
    const left = viewport.scrollLeft;
    const top = viewport.scrollTop;

    viewport.scrollBy(dx, dy);

    if (viewport.scrollLeft !== left || viewport.scrollTop !== top) {
      this.#updatePointer();
      this.#scheduleScroll();
    }
  }

  #handlePointerEnd(input: PointerEndGesture) {
    const event = input.event;
    const pointer = this.#session?.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;

    pointer.currentX = input.clientX;
    pointer.currentY = input.clientY;
    pointer.moved ||= Math.hypot(input.clientX - pointer.x, input.clientY - pointer.y) >= 3;

    if (input.interrupted) {
      this.cancel();
    } else if (pointer.moved) {
      this.#finishPointerMove();
    } else {
      this.cancel();
    }
  }

  #finishPointerMove() {
    if (
      !this.#session ||
      this.#session.stateKey !== this.#delegate.getArrangementStateKey() ||
      (this.#session.proposed && !this.#admit(this.#session))
    ) {
      this.cancel();
      return;
    }

    this.#updatePointer();
    this.#finish(true);
  }

  #endPointerTracking(session: PointerArrangementSession) {
    for (const target of session.pointer?.scrollTargets ?? []) {
      target.removeEventListener('scroll', this.#scroll);
    }

    session.pointer = undefined;
  }

  #scroll = (event: Event) => {
    if (event.target === event.currentTarget && this.#session?.pointer?.moved) {
      this.#updatePointer();
    }
  };
}

function getEdgeScrollSpeed(position: number, start: number, end: number): number {
  if (position < start + 24) return -12;

  return position > end - 24 ? 12 : 0;
}

function getScrollAncestors(viewport: HTMLElement): readonly Node[] {
  const targets: Node[] = [];
  let node: Node | null = viewport;

  while (node) {
    targets.push(node);
    node =
      (node instanceof Element && node.assignedSlot) ||
      node.parentNode ||
      (node instanceof ShadowRoot ? node.host : null);
  }

  return targets;
}

interface PointerSample {
  readonly session: PointerArrangementSession;
  readonly pointer: NonNullable<PointerArrangementSession['pointer']>;
  readonly source: DashboardItem;
  readonly viewport: HTMLElement;
  readonly canvasClientRect: DOMRectReadOnly;
}

function hasOnlyShiftModifier(event: KeyboardEvent): boolean {
  return event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey;
}

function getBoundedAxisStartStep(key: string, boundedAxis: 'column' | 'row', isRtl: boolean): number {
  const negative = boundedAxis === 'column' ? (isRtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
  const positive = boundedAxis === 'column' ? (isRtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
  if (key === negative) return -1;

  return key === positive ? 1 : 0;
}

function getInlineOffset(
  clientX: number,
  bounds: Pick<DOMRectReadOnly, 'left' | 'right'>,
  readingDirection: DashboardReadingDirection
): number {
  return readingDirection === 'rtl' ? bounds.right - clientX : clientX - bounds.left;
}

function getPointerGeometry(sample: PointerSample) {
  const { session, pointer, source, canvasClientRect } = sample;
  const initialPixelPlacement = pointer.initialPixelPlacement;
  const delta = {
    inline:
      getInlineOffset(pointer.currentX, canvasClientRect, session.readingDirection) -
      pointer.grabX -
      initialPixelPlacement.inlineStart,
    vertical: pointer.currentY - canvasClientRect.top - pointer.grabY - initialPixelPlacement.top
  };
  const metrics = session.initialMetrics;
  if (session.action === 'resize') {
    return getAnchoredResizeGeometry(
      {
        source,
        initialPixelPlacement,
        delta,
        edge: session.edge,
        grid: session.initialLayout.grid,
        limits: session.panel._getSpanConstraints(),
        readingDirection: session.readingDirection
      },
      metrics
    );
  }

  return {
    canvasPlacement: {
      ...initialPixelPlacement,
      inlineStart: initialPixelPlacement.inlineStart + delta.inline,
      top: initialPixelPlacement.top + delta.vertical
    },
    geometry: {
      ...source,
      column: (initialPixelPlacement.inlineStart + delta.inline) / (metrics.columnSize + metrics.gap),
      row: (initialPixelPlacement.top + delta.vertical) / (metrics.rowSize + metrics.gap)
    }
  };
}

function createPointerIntent(sample: PointerSample, geometry: DashboardGridGeometry): DashboardPointerIntent {
  const { session, pointer, canvasClientRect } = sample;
  if (session.action === 'resize') {
    return {
      kind: 'anchored-resize',
      geometry,
      edge: session.edge
    };
  }
  if (isAtGrowthStart(sample)) return { kind: 'start', geometry };

  const { columnSize, rowSize, gap } = session.initialMetrics;

  return {
    kind: 'pointer',
    geometry,
    position: {
      aimGeometry: geometry,
      pointerPosition: {
        column: getInlineOffset(pointer.currentX, canvasClientRect, session.readingDirection) / (columnSize + gap),
        row: (pointer.currentY - canvasClientRect.top) / (rowSize + gap)
      },
      spacingFraction: { column: gap / (columnSize + gap), row: gap / (rowSize + gap) }
    }
  };
}

function getGrowthStartSample(sample: PointerSample) {
  const { session, pointer, canvasClientRect, viewport } = sample;
  if (session.initialLayout.grid.flow === 'vertical') {
    return {
      distance: pointer.currentY - canvasClientRect.top,
      travel: pointer.currentY - pointer.y,
      scroll: viewport.scrollTop,
      boundedPosition: pointer.currentX,
      boundedStart: canvasClientRect.left,
      boundedEnd: canvasClientRect.right
    };
  }

  const isRtl = session.readingDirection === 'rtl';

  return {
    distance: getInlineOffset(pointer.currentX, canvasClientRect, session.readingDirection),
    travel: (pointer.currentX - pointer.x) * (isRtl ? -1 : 1),
    scroll: viewport.scrollLeft,
    boundedPosition: pointer.currentY,
    boundedStart: canvasClientRect.top,
    boundedEnd: canvasClientRect.bottom
  };
}

function isAtGrowthStart(sample: PointerSample): boolean {
  const { distance, travel, scroll, boundedPosition, boundedStart, boundedEnd } = getGrowthStartSample(sample);
  return (
    sample.session.action === 'move' &&
    Math.abs(scroll) <= 1 &&
    distance <= 8 &&
    travel <= -3 &&
    boundedPosition >= boundedStart &&
    boundedPosition <= boundedEnd
  );
}

function getPointerArrangementAction(
  control: DashboardInteractionControl,
  action: DashboardAction
): PointerArrangementAction {
  return action === 'resize' ? { action, edge: control.edge ?? getDashboardResizeCorner(control.panel) } : { action };
}

function getKeyboardCommand(key: string, action: DashboardAction, isRtl: boolean): string | undefined {
  if (action === 'resize' && isRtl) {
    if (key === 'ArrowLeft') return '--increase-width';
    if (key === 'ArrowRight') return '--decrease-width';
  }

  return keyCommands[key]?.[action];
}

function isDashboardAction(value: string): value is DashboardAction {
  return value === 'move' || value === 'resize';
}
