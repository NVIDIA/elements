// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';
import { GestureController, type Gesture, type GestureInput } from '@nvidia-elements/core/internal';
import type { WorkspacePlacementContext } from './workspace-context.utils.js';
import type { WorkspaceDropIntent } from './workspace-drag-preview.utils.js';
import type { WorkspaceLayout } from './workspace-layout.utils.js';
import type { WorkspaceDestination } from './workspace-operations.utils.js';
import type { WorkspacePlacedRegion } from './workspace-placement.utils.js';
import type { WorkspacePlacementPlan } from './workspace-planner.utils.js';
import type { WorkspaceSeamPreview } from './workspace-seams.utils.js';
import { tabInsertionIndex } from './workspace-tabs.utils.js';
import type { WorkspaceDropReservation } from './workspace-targeting.utils.js';

export interface WorkspaceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkspaceTarget {
  panels: string[];
  headerHeight: number;
  rect: WorkspaceRect;
  tabs: { id: string; rect: WorkspaceRect }[];
}

export interface WorkspaceDragCue {
  rect: WorkspaceRect;
  kind: 'tab' | 'group';
}

interface PreviewPresentation {
  seams?: WorkspaceSeamPreview;
  context?: WorkspacePlacementContext;
  source: string[];
  point?: { x: number; y: number };
  cue: WorkspaceDragCue;
}

interface AttachedPreview extends PreviewPresentation {
  phase: 'attached';
  intent: { kind: 'invalid' };
  blocked: false;
}

export type WorkspaceDragAllocation =
  | { allocation: 'overlay' | 'committed' }
  | { allocation: 'reserved'; layout: WorkspaceLayout };

export type WorkspaceDragOffer = {
  cue: WorkspaceDragCue;
  feasible: boolean;
  seams?: WorkspaceSeamPreview;
  context?: WorkspacePlacementContext;
} & WorkspaceDragAllocation;

type DetachedPreview = PreviewPresentation &
  WorkspaceDragAllocation & {
    phase: 'detached';
    intent: WorkspaceDropIntent;
    blocked: boolean;
  };

export type WorkspaceDragPreview =
  | AttachedPreview
  | DetachedPreview
  | (PreviewPresentation &
      WorkspaceDragAllocation & {
        phase: 'returning-attached' | 'returning-detached';
        intent: { kind: 'invalid' };
        blocked: false;
      });

export interface WorkspacePlacementAcquisition {
  plan: WorkspacePlacementPlan;
  rect: WorkspaceRect;
}

export interface WorkspaceOfferContext {
  selected?: WorkspaceDragPreview;
  acquisition?: WorkspacePlacementAcquisition & { point: { x: number; y: number } };
}

interface RearrangeOptions {
  evaluate: (work: () => void) => void;
  enabled: () => boolean;
  detachThreshold: () => number;
  catalog: (source: string[]) => {
    targets: WorkspaceTarget[];
    regions: WorkspacePlacedRegion[];
    orderingRegions?: WorkspacePlacedRegion[];
    sourceSlot?: WorkspaceRect;
    headers?: WorkspaceRect[];
    preview?: WorkspaceDragPreview;
    bounds: WorkspaceRect;
  };
  header: (source: string[], point: { x: number; y: number }) => WorkspaceTarget | undefined;
  reservation: (point: { x: number; y: number }) => WorkspaceDropReservation | undefined;
  capturePresentation: () => () => void;
  resolve?: (input: {
    source: string[];
    point: { x: number; y: number };
    local?: WorkspaceDropIntent;
    header: boolean;
    regions: WorkspacePlacedRegion[];
    orderingRegions?: WorkspacePlacedRegion[];
    sourceSlot?: WorkspaceRect;
    headers?: WorkspaceRect[];
    preview?: WorkspaceDragPreview;
    reservation?: WorkspaceDropReservation;
    bounds: WorkspaceRect;
  }) => { intent: WorkspaceDropIntent | undefined; acquisition?: WorkspacePlacementAcquisition };
  initialPlacement?: (
    source: string[],
    cue: WorkspaceDragCue
  ) => { intent: WorkspaceDropIntent; offer: WorkspaceDragOffer } | undefined;
  initialCue: (source: string[], group: boolean) => WorkspaceDragCue;
  offer: (
    source: string[],
    intent: WorkspaceDropIntent,
    context?: WorkspaceOfferContext
  ) => WorkspaceDragOffer | undefined;
  groupSource: (anchor: string) => string[];
  activate: (source: string[], group: boolean) => void;
  restoreFocus: (source: string[], group: boolean) => void;
  preview: (preview: WorkspaceDragPreview | undefined) => void;
  returnPreview: (preview: WorkspaceDragPreview) => Promise<void>;
  commit: (
    source: string[],
    intent: Exclude<WorkspaceDropIntent, { kind: 'invalid' }>,
    layout?: WorkspaceLayout
  ) => boolean;
}

interface SessionOrigin {
  source: string[];
  group: boolean;
  controlRect: WorkspaceRect;
  initialCue: WorkspaceDragCue;
  detachThreshold: number;
  initialAllocation: WorkspaceDragAllocation;
  initialPlacement?: { intent: WorkspaceDropIntent; offer: WorkspaceDragOffer };
  restorePresentation?: () => void;
}

type AttachedSession = SessionOrigin & {
  phase: 'attached';
  point: { x: number; y: number };
  preview: AttachedPreview;
};

type DetachedSession = SessionOrigin & {
  phase: 'detached';
  point: { x: number; y: number };
  preview: DetachedPreview;
  lastFeasible: DetachedPreview;
  pendingFrame?: number;
};

type WorkspaceRearrangeControllerSession = (SessionOrigin & { phase: 'pressed' }) | AttachedSession | DetachedSession;

/** Owns pressed, attached, and detached workspace gesture phases. */
export class WorkspaceRearrangeController {
  readonly #host: HTMLElement & ReactiveControllerHost;

  readonly #options: RearrangeOptions;

  readonly #gesture: GestureController;

  #session?: WorkspaceRearrangeControllerSession;

  get suppressSelection() {
    return this.#suppressClick || this.#session?.phase === 'attached' || this.#session?.phase === 'detached';
  }

  #suppressClick = false;

  #cursor?: { value: string; priority: string; owned: string };

  #returning?: { source: string[]; group: boolean };

  constructor(host: HTMLElement & ReactiveControllerHost, options: RearrangeOptions) {
    this.#host = host;
    this.#options = options;
    this.#gesture = new GestureController(host, {
      claimPriority: 'descendant-first',
      suppressNativeDrag: true,
      shouldIgnoreEvent: event => !options.enabled() || this.#returning !== undefined || !this.#control(event)
    });
    this.#gesture.target = host;
    host.addController(this);
  }

  hostConnected() {
    this.#host.addEventListener('nve-gesture-input', this.#input as EventListener);
    this.#host.addEventListener('nve-gesture', this.#movement as EventListener);
    this.#host.addEventListener('click', this.#click, true);
    this.#host.ownerDocument.addEventListener('keydown', this.#keydown);
    this.#host.ownerDocument.addEventListener('pointerdown', this.#freshPointer, true);
  }

  hostDisconnected() {
    this.#host.removeEventListener('nve-gesture-input', this.#input as EventListener);
    this.#host.removeEventListener('nve-gesture', this.#movement as EventListener);
    this.#host.removeEventListener('click', this.#click, true);
    this.#host.ownerDocument.removeEventListener('keydown', this.#keydown);
    this.#host.ownerDocument.removeEventListener('pointerdown', this.#freshPointer, true);
    this.cancel();
  }

  refresh() {
    const session = this.#session;
    if (!session || session.phase === 'pressed') return;
    if (session.phase === 'attached') {
      session.initialCue = this.#options.initialCue(session.source, session.group);
      session.preview = { ...session.preview, cue: session.initialCue };
      this.#options.preview(session.preview);
      return;
    }
    if (session.pendingFrame !== undefined) return;
    const refresh = (preview: DetachedPreview): DetachedPreview => {
      const offer = this.#options.offer(session.source, preview.intent, { selected: preview });
      if (!offer) return preview;
      const { feasible, context, seams, ...presentation } = offer;
      return {
        ...preview,
        ...presentation,
        seams,
        context: context,
        blocked: !feasible
      };
    };
    session.lastFeasible = refresh(session.lastFeasible);
    session.preview = refresh(session.preview);
    this.#publish(session.preview);
  }

  cancelForUser() {
    if (this.#returning) return;
    const session = this.#session;
    if (!session || session.phase === 'pressed') {
      this.cancel();
      if (session) this.#options.restoreFocus(session.source, session.group);
      return;
    }
    if (session.phase === 'detached' && session.pendingFrame !== undefined) cancelAnimationFrame(session.pendingFrame);
    this.#restoreCursor();
    this.#session = undefined;
    this.#suppressClick = true;
    const returning = { source: session.source, group: session.group };
    this.#returning = returning;
    const completion = this.#options.returnPreview({
      source: session.source,

      ...session.initialAllocation,
      phase: session.phase === 'attached' ? 'returning-attached' : 'returning-detached',
      intent: { kind: 'invalid' },
      cue: this.#options.initialCue(session.source, session.group),
      blocked: false
    });
    session.restorePresentation?.();
    void completion.then(() => {
      if (this.#returning !== returning) return;
      this.#returning = undefined;
      this.#options.preview(undefined);
      this.#options.restoreFocus(returning.source, returning.group);
    });
  }

  cancel() {
    this.#restoreCursor();
    this.#returning = undefined;
    this.#suppressClick ||= this.#session !== undefined && this.#session.phase !== 'pressed';
    if (this.#session?.phase === 'detached' && this.#session.pendingFrame !== undefined)
      cancelAnimationFrame(this.#session.pendingFrame);
    this.#session = undefined;
    this.#options.preview(undefined);
  }

  #freshPointer = () => {
    if (this.#returning) this.cancel();
    this.#suppressClick = false;
  };

  #keydown = (event: KeyboardEvent) => {
    if (this.#returning && event.key !== 'Escape' && !event.repeat) this.cancel();
    if (event.key === 'Escape' && (this.#session || this.#returning)) {
      event.preventDefault();
      this.cancelForUser();
    }
  };

  #click = (event: Event) => {
    if (!this.#suppressClick) return;
    if (event instanceof MouseEvent && event.detail === 0) {
      this.#suppressClick = false;
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    this.#suppressClick = false;
  };

  #setCursor(cursor: 'grabbing' | 'no-drop') {
    this.#cursor ??= {
      value: this.#host.style.getPropertyValue('cursor'),
      priority: this.#host.style.getPropertyPriority('cursor'),
      owned: cursor
    };
    this.#cursor.owned = cursor;
    this.#host.style.setProperty('cursor', cursor, 'important');
  }

  #restoreCursor() {
    const previous = this.#cursor;
    if (!previous) return;
    this.#cursor = undefined;
    if (
      this.#host.style.getPropertyValue('cursor') !== previous.owned ||
      this.#host.style.getPropertyPriority('cursor') !== 'important'
    )
      return;
    if (previous.value) this.#host.style.setProperty('cursor', previous.value, previous.priority);
    else this.#host.style.removeProperty('cursor');
  }

  #control(event: Event): HTMLElement | undefined {
    return event
      .composedPath()
      .find(
        (item): item is HTMLElement =>
          item instanceof HTMLElement &&
          item.getRootNode() === this.#host.shadowRoot &&
          (item.hasAttribute('data-panel') || item.hasAttribute('data-drag-group'))
      );
  }

  #source(control: HTMLElement): string[] | undefined {
    if (control.dataset.panel) return [control.dataset.panel];
    return control.dataset.dragGroup ? this.#options.groupSource(control.dataset.dragGroup) : undefined;
  }

  #input = (event: CustomEvent<GestureInput>) => {
    if (event.target !== this.#host) return;
    const input = event.detail;
    if (input.kind === 'pointerdown') this.#start(input);
    else if (input.kind === 'pointerend') this.#end(input);
  };

  #start(input: Extract<GestureInput, { kind: 'pointerdown' }>) {
    const control = this.#control(input.event);
    if (!control) return;
    const source = this.#source(control);
    if (!source || !this.#options.enabled() || input.event.button !== 0 || !input.event.isPrimary || this.#session)
      return;
    if (!input.claim({ kind: 'drag' })) return;
    this.#suppressClick = false;
    const threshold = this.#options.detachThreshold();
    const initialCue = this.#options.initialCue(source, control.hasAttribute('data-drag-group'));
    const presentation = this.#initialPresentation(source, initialCue);
    this.#session = {
      source,
      phase: 'pressed',
      ...presentation,
      detachThreshold: Number.isFinite(threshold) && threshold >= 0 ? threshold : 48,
      group: control.hasAttribute('data-drag-group'),
      controlRect: control.getBoundingClientRect(),
      initialCue,
      restorePresentation: this.#options.capturePresentation()
    };
  }

  #initialPresentation(source: string[], cue: WorkspaceDragCue) {
    return {
      initialAllocation: { allocation: 'committed' as const },
      initialPlacement: this.#options.initialPlacement?.(source, cue)
    };
  }

  #end(input: Extract<GestureInput, { kind: 'pointerend' }>) {
    const session = this.#session;
    if (!session) return;
    if (input.interrupted || input.reason !== 'up') {
      this.cancelForUser();
      return;
    }
    if (session.phase === 'detached' && session.preview.blocked) {
      this.cancelForUser();
      return;
    }
    const committed = session.phase === 'detached' ? this.#drop(session) : false;
    if (session.phase === 'pressed') this.#activate(session, input);
    const noOffer = session.phase !== 'pressed' && !committed;
    this.#suppressClick = true;
    this.cancel();
    if (noOffer) this.#restorePresentation(session);
  }

  #restorePresentation(session: SessionOrigin) {
    this.#options.restoreFocus(session.source, session.group);
    session.restorePresentation?.();
  }

  #drop(session: DetachedSession) {
    const intent = session.preview.intent;
    return intent.kind !== 'invalid'
      ? this.#options.commit(
          session.source,
          intent,
          session.preview.allocation === 'reserved' ? session.preview.layout : undefined
        )
      : false;
  }

  #activate(
    session: { source: string[]; group: boolean; controlRect: WorkspaceRect },
    input: Extract<GestureInput, { kind: 'pointerend' }>
  ) {
    const rect = session.controlRect;
    if (
      input.clientX >= rect.x &&
      input.clientX <= rect.x + rect.width &&
      input.clientY >= rect.y &&
      input.clientY <= rect.y + rect.height
    )
      this.#options.activate(session.source, session.group);
  }

  #movement = (event: CustomEvent<Gesture<undefined>>) => {
    const input = event.detail;
    const session = this.#session;
    if (!session || input.kind !== 'drag') return;
    const distance = Math.hypot(input.totalDisplacementX, input.totalDisplacementY);
    if (session.phase === 'pressed' && distance < 6) return;
    const point = { x: input.clientX, y: input.clientY };
    if (session.phase === 'detached') {
      session.point = point;
      if (session.pendingFrame === undefined) this.#offerAt(session, point);
      return;
    }
    const attached: AttachedSession = {
      ...session,
      phase: 'attached',
      point,
      preview: {
        source: session.source,

        phase: 'attached',
        point,
        intent: { kind: 'invalid' },
        cue: session.initialCue,
        blocked: false
      }
    };
    this.#setCursor('grabbing');
    if (distance >= session.detachThreshold) this.#detach(attached);
    else {
      this.#session = attached;
      this.#options.preview(attached.preview);
    }
  };

  #detach(attached: AttachedSession) {
    const origin: WorkspaceDragOffer = attached.initialPlacement?.offer ?? {
      ...attached.initialAllocation,
      cue: attached.initialCue,
      feasible: true
    };
    const { feasible, ...initial } = origin;
    const preview: DetachedPreview = {
      ...attached.preview,
      ...initial,
      intent: attached.initialPlacement?.intent ?? attached.preview.intent,
      context: initial.context,
      blocked: !feasible,
      phase: 'detached'
    };
    const session: DetachedSession = { ...attached, phase: 'detached', preview, lastFeasible: preview };
    this.#session = session;
    this.#options.preview(preview);
    session.pendingFrame = requestAnimationFrame(() => {
      session.pendingFrame = undefined;
      if (this.#session !== session) return;
      this.#host.shadowRoot?.querySelector('[data-destination-ghost]')?.getBoundingClientRect();
      this.#offerAt(session, session.point);
    });
  }

  #offerAt(session: DetachedSession, point: { x: number; y: number }) {
    this.#options.evaluate(() => this.#evaluateOffer(session, point));
  }

  #evaluateOffer(session: DetachedSession, point: { x: number; y: number }) {
    const decision = this.#intentAt(session, point);
    const intent = decision.intent;
    if (!intent) {
      this.#setCursor(session.lastFeasible.blocked ? 'no-drop' : 'grabbing');
      session.preview = { ...session.lastFeasible, point };
      this.#options.preview(session.preview);
      return;
    }
    const offer = this.#options.offer(session.source, intent, {
      selected: session.preview,
      acquisition: decision.acquisition ? { ...decision.acquisition, point } : undefined
    });
    if (!offer) {
      this.#options.preview({ ...session.preview, point });
      return;
    }
    const { feasible, context, ...presentation } = offer;
    session.preview = {
      context: context,
      ...presentation,
      source: session.source,

      phase: 'detached',
      point,
      intent,
      cue: offer.cue,
      blocked: !feasible
    };
    if (feasible) session.lastFeasible = session.preview;
    this.#publish(session.preview);
  }

  #intentAt(session: DetachedSession, point: { x: number; y: number }) {
    const displayed = this.#options.header(session.source, point);
    const { targets, regions, bounds, orderingRegions, sourceSlot, headers, preview } = this.#options.catalog(
      session.source
    );
    const target =
      displayed ??
      (contains(bounds, point.x, point.y) ? targets.find(item => contains(item.rect, point.x, point.y)) : undefined);
    const header = !!displayed;
    const { intent, reservation } = this.#localPlacement(session, { ...point, header }, target);
    return this.#options.resolve
      ? this.#options.resolve({
          source: session.source,
          point,
          local: intent,
          header,
          regions,
          orderingRegions,
          sourceSlot,
          headers,
          preview,
          reservation,
          bounds
        })
      : { intent };
  }

  #localPlacement(
    session: DetachedSession,
    point: { x: number; y: number; header: boolean },
    target: WorkspaceTarget | undefined
  ) {
    const reservation = this.#options.reservation(point);
    const held = session.preview.intent;
    if ((!point.header && reservation) || (point.header && reservation === 'tab' && held.kind === 'tab')) {
      return { intent: held, reservation };
    }
    return { intent: target ? this.#targetIntent(target, point) : undefined, reservation };
  }

  #publish(preview: DetachedPreview) {
    this.#setCursor(preview.blocked ? 'no-drop' : 'grabbing');
    this.#options.preview(preview);
  }

  #targetIntent(
    target: WorkspaceTarget,
    point: { x: number; y: number; header: boolean }
  ): WorkspaceDropIntent | undefined {
    const { x, header } = point;
    const anchor = target.panels[0];
    if (!anchor) return { kind: 'invalid' };
    if (header) {
      const tab = target.tabs.find(item => x < item.rect.x + item.rect.width / 2);
      const preferred = this.#options.groupSource(anchor);
      const index = tabInsertionIndex(preferred, tab?.id);
      return { kind: 'tab', destination: { target: anchor, position: 'tab', index } };
    }
    return this.#contentIntent(target, point);
  }

  #contentIntent(target: WorkspaceTarget, point: { x: number; y: number }): WorkspaceDropIntent | undefined {
    const anchor = target.panels[0]!;
    return {
      kind: 'split',
      destination: {
        target: anchor,
        position: contentDirection(point.x, point.y, { rect: target.rect, headerHeight: target.headerHeight })
      }
    };
  }
}

export function contentDirection(
  x: number,
  y: number,
  input: { rect: WorkspaceRect; headerHeight: number }
): Exclude<WorkspaceDestination['position'], 'tab'> {
  const { rect, headerHeight } = input;
  const centerX = rect.x + rect.width / 2;
  const contentHeight = Math.max(1, rect.height - headerHeight);
  const centerY = rect.y + headerHeight + contentHeight / 2;
  const dx = (x - centerX) / Math.max(1, rect.width / 2);
  const dy = (y - centerY) / Math.max(1, contentHeight / 2);
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'top' : 'bottom';
}

function contains(rect: WorkspaceRect, x: number, y: number) {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}
