// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';
import { GestureController, type Gesture, type GestureInput } from '@nvidia-elements/core/internal';
import type {
  WorkspaceDropIntent,
  WorkspaceDragCue,
  WorkspaceDragAllocation,
  WorkspaceDragOffer,
  WorkspaceDragPreview,
  WorkspacePlacementAcquisition,
  WorkspaceOfferContext
} from '../utils/workspace-drag-preview.utils.js';
import type { WorkspaceLayout } from '../utils/workspace-layout.utils.js';
import type { WorkspacePlacedRegion, WorkspaceRect } from '../utils/workspace-placement.utils.js';
import { tabInsertionIndex } from '../utils/workspace-tabs.utils.js';
import {
  contentDirection,
  type WorkspaceDropReservation,
  type WorkspaceTarget
} from '../utils/workspace-targeting.utils.js';

export interface WorkspaceRearrangeCapabilities {
  rearrangeable: boolean;
  groupable: boolean;
}

interface RearrangeOptions {
  evaluate: (work: () => void) => void;
  enabled: () => boolean;
  capabilities: () => WorkspaceRearrangeCapabilities;
  panelSource: (anchor: string) => string[];
  allowsMembership: (source: string[], intent: Exclude<WorkspaceDropIntent, { kind: 'invalid' }>) => boolean;
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
  captureScroll: () => () => void;
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
  captureFocus: () => (() => void) | undefined;
  preview: (preview: WorkspaceDragPreview | undefined) => void;
  returnPreview: (preview: WorkspaceDragPreview) => Promise<void>;
  commit: (
    source: string[],
    intent: Exclude<WorkspaceDropIntent, { kind: 'invalid' }>,
    layout?: WorkspaceLayout
  ) => boolean;
}

type AttachedPreview = Extract<WorkspaceDragPreview, { phase: 'attached' }>;

type DetachedPreview = Extract<WorkspaceDragPreview, { phase: 'detached' }>;

interface SessionOrigin {
  capabilities: WorkspaceRearrangeCapabilities;
  source: string[];
  group: boolean;
  controlRect: WorkspaceRect;
  initialCue: WorkspaceDragCue;
  detachThreshold: number;
  initialAllocation: WorkspaceDragAllocation;
  initialPlacement?: { intent: WorkspaceDropIntent; offer: WorkspaceDragOffer };
  restoreScroll?: () => void;
  restoreFocus?: () => void;
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
  pendingInput: boolean;
  pendingRefresh: boolean;
  initialPaint: boolean;
};

type WorkspaceRearrangeControllerSession = (SessionOrigin & { phase: 'pressed' }) | AttachedSession | DetachedSession;

/** Owns pressed, attached, and detached workspace gesture phases. */
export class WorkspaceRearrangeController {
  readonly #host: HTMLElement & ReactiveControllerHost;

  readonly #options: RearrangeOptions;

  readonly #gesture: GestureController;

  #session?: WorkspaceRearrangeControllerSession;

  #document?: Document;

  #suppressClick = false;

  #cursor?: { value: string; priority: string; owned: string };

  #pendingRecovery?: SessionOrigin;

  constructor(host: HTMLElement & ReactiveControllerHost, options: RearrangeOptions) {
    this.#host = host;
    this.#options = options;
    this.#gesture = new GestureController(host, {
      claimPriority: 'descendant-first',
      suppressNativeDrag: true,
      shouldIgnoreEvent: event => {
        const control = this.#control(event);
        return (!this.#session && !this.#allowsDrag(control)) || this.#pendingRecovery !== undefined || !control;
      }
    });
    this.#gesture.target = host;
    host.addController(this);
  }

  get capabilities() {
    return this.#session?.capabilities;
  }

  get suppressSelection() {
    return this.#suppressClick || this.#session?.phase === 'attached' || this.#session?.phase === 'detached';
  }

  hostConnected() {
    this.#document = this.#host.ownerDocument;
    this.#host.addEventListener('nve-gesture-input', this.#input as EventListener);
    this.#host.addEventListener('nve-gesture', this.#movement as EventListener);
    this.#host.addEventListener('click', this.#click, true);
    this.#document.addEventListener('keydown', this.#keydown);
    this.#document.addEventListener('pointerdown', this.#freshPointer, true);
  }

  hostDisconnected() {
    this.#host.removeEventListener('nve-gesture-input', this.#input as EventListener);
    this.#host.removeEventListener('nve-gesture', this.#movement as EventListener);
    this.#host.removeEventListener('click', this.#click, true);
    this.#document?.removeEventListener('keydown', this.#keydown);
    this.#document?.removeEventListener('pointerdown', this.#freshPointer, true);
    this.#document = undefined;
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
    session.pendingRefresh = true;
    this.#requestFrame(session);
  }

  cancelForUser() {
    if (this.#pendingRecovery) return;
    const session = this.#session;
    if (!session || session.phase === 'pressed') {
      this.cancel();
      return;
    }
    if (session.phase === 'detached') this.#cancelFrame(session);
    this.#restoreCursor();
    this.#session = undefined;
    this.#suppressClick = true;
    const recovery = session;
    this.#pendingRecovery = recovery;
    const completion = this.#options.returnPreview({
      source: session.source,

      ...session.initialAllocation,
      phase: session.phase === 'attached' ? 'returning-attached' : 'returning-detached',
      intent: { kind: 'invalid' },
      cue: this.#options.initialCue(session.source, session.group),
      blocked: false
    });
    session.restoreScroll?.();
    void completion.then(() => {
      if (this.#pendingRecovery !== recovery) return;
      this.#options.preview(undefined);
      void this.#completeRecovery(recovery);
    });
  }

  cancel() {
    this.#restoreCursor();
    this.#pendingRecovery = undefined;
    this.#suppressClick ||= this.#session !== undefined && this.#session.phase !== 'pressed';
    if (this.#session?.phase === 'detached') this.#cancelFrame(this.#session);
    this.#session = undefined;
    this.#options.preview(undefined);
  }

  #refreshSelected(session: DetachedSession) {
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
  }

  #freshPointer = () => {
    if (this.#pendingRecovery) this.cancel();
    this.#suppressClick = false;
  };

  #keydown = (event: KeyboardEvent) => {
    if (this.#pendingRecovery && event.key !== 'Escape' && !event.repeat) this.cancel();
    if (event.key === 'Escape' && !event.defaultPrevented && this.#session) {
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

  #allowsDrag(control: HTMLElement | undefined, capabilities = this.#options.capabilities()): boolean {
    return (
      !!control &&
      this.#options.enabled() &&
      capabilities.rearrangeable &&
      (capabilities.groupable || control.localName !== 'nve-tabs-item')
    );
  }

  #source(control: HTMLElement): string[] | undefined {
    if (control.dataset.panel) return this.#options.panelSource(control.dataset.panel);
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
    const capabilities = this.#options.capabilities();
    const source = this.#source(control);
    if (
      !source ||
      !this.#allowsDrag(control, capabilities) ||
      input.event.button !== 0 ||
      !input.event.isPrimary ||
      this.#session
    )
      return;
    if (!input.claim({ kind: 'drag' })) return;
    this.#suppressClick = false;
    const threshold = this.#options.detachThreshold();
    const initialCue = this.#options.initialCue(source, control.hasAttribute('data-drag-group'));
    const presentation = this.#initialPresentation(source, initialCue);
    this.#session = {
      source,
      phase: 'pressed',
      capabilities,
      ...presentation,
      detachThreshold: Number.isFinite(threshold) && threshold >= 0 ? threshold : 48,
      group: control.hasAttribute('data-drag-group'),
      controlRect: control.getBoundingClientRect(),
      initialCue,
      restoreScroll: this.#options.captureScroll()
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
    if (session.phase === 'detached' && !this.#prepareDrop(session)) {
      if (this.#session === session) this.cancelForUser();
      return;
    }
    const committed = session.phase === 'detached' ? this.#drop(session) : false;
    if (session.phase === 'pressed') this.#activate(session, input);
    this.#suppressClick = true;
    this.cancel();
    if (session.phase !== 'pressed') this.#recoverAfterDrop(session, committed);
  }

  #prepareDrop(session: DetachedSession) {
    this.#cancelFrame(session);
    session.initialPaint = false;
    this.#flushPending(session);
    return this.#session === session && !session.preview.blocked;
  }

  #recoverAfterDrop(session: SessionOrigin, committed: boolean) {
    this.#pendingRecovery = session;
    if (!committed) session.restoreScroll?.();
    void this.#completeRecovery(session);
  }

  async #completeRecovery(session: SessionOrigin) {
    await this.#host.updateComplete;
    if (this.#pendingRecovery !== session) return;
    this.#pendingRecovery = undefined;
    session.restoreFocus?.();
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
      this.#queueInput(session, point);
      return;
    }
    const attached: AttachedSession = {
      ...session,
      restoreFocus: session.phase === 'pressed' ? this.#options.captureFocus() : session.restoreFocus,
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
    const session: DetachedSession = {
      ...attached,
      phase: 'detached',
      preview,
      lastFeasible: preview,
      pendingInput: true,
      pendingRefresh: false,
      initialPaint: true
    };
    this.#session = session;
    this.#options.preview(preview);
    this.#requestFrame(session);
  }

  #queueInput(session: DetachedSession, point: { x: number; y: number }) {
    session.point = point;
    session.pendingInput = true;
    this.#requestFrame(session);
  }

  #requestFrame(session: DetachedSession) {
    if (session.pendingFrame !== undefined) return;
    const frame = requestAnimationFrame(() => {
      if (this.#session !== session || session.pendingFrame !== frame) return;
      session.pendingFrame = undefined;
      if (session.initialPaint) {
        session.initialPaint = false;
        this.#host.shadowRoot?.querySelector('[data-destination-ghost]')?.getBoundingClientRect();
      }
      this.#flushPending(session);
    });
    session.pendingFrame = frame;
  }

  #cancelFrame(session: DetachedSession) {
    if (session.pendingFrame !== undefined) cancelAnimationFrame(session.pendingFrame);
    session.pendingFrame = undefined;
  }

  #flushPending(session: DetachedSession) {
    const pointerPending = session.pendingInput;
    const refreshPending = session.pendingRefresh;
    session.pendingInput = false;
    session.pendingRefresh = false;
    if (refreshPending) this.#refreshSelected(session);
    if (this.#session !== session) return;
    if (pointerPending) this.#offerAt(session, session.point);
    else if (refreshPending) this.#publish(session.preview);
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
    const overReservedBody = !point.header && reservation;
    const overReservedTab = point.header && reservation === 'tab' && held.kind === 'tab';
    if (overReservedBody || overReservedTab) {
      return { intent: held, reservation };
    }
    return { intent: target ? this.#targetIntent(target, point, session.source) : undefined, reservation };
  }

  #publish(preview: DetachedPreview) {
    this.#setCursor(preview.blocked ? 'no-drop' : 'grabbing');
    this.#options.preview(preview);
  }

  #targetIntent(
    target: WorkspaceTarget,
    point: { x: number; y: number; header: boolean },
    source: string[]
  ): WorkspaceDropIntent | undefined {
    const { x, header } = point;
    const anchor = target.panels[0];
    if (!anchor) return { kind: 'invalid' };
    if (header) {
      const tab = target.tabs.find(item => x < item.rect.x + item.rect.width / 2);
      const preferred = this.#options.groupSource(anchor);
      const index = tabInsertionIndex(preferred, tab?.id);
      const intent = { kind: 'tab', destination: { target: anchor, position: 'tab', index } } as const;
      return this.#options.allowsMembership(source, intent) ? intent : undefined;
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

function contains(rect: WorkspaceRect, x: number, y: number) {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}
