// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

import {
  type Gesture,
  GestureController,
  type GestureInput,
  nonnegativeFiniteOr,
  type Point,
  type Rect
} from '@nvidia-elements/core/internal';

import { decidePlacement, decidePointerPlacement } from '../utils/interaction/placement-decision.utils.js';
import { getWorkspacePanelSource } from '../utils/model/membership.utils.js';
import { findGroup } from '../utils/model/operations.utils.js';
import { createInitialReservation } from '../utils/placement/origin.utils.js';
import { createWorkspacePlacementPlanner } from '../utils/placement/planner.utils.js';
import { evaluatePlacementOffer } from '../utils/placement/preparation.utils.js';
import { captureTabScroll, captureWorkspaceFocus } from '../utils/presentation/composition.utils.js';
import { getAllocatedTabWidth, getInitialDragCue } from '../utils/presentation/groups.utils.js';

import type {
  WorkspaceDragAllocation,
  WorkspaceDragCue,
  WorkspaceDragOffer,
  WorkspaceDragPreview,
  WorkspaceDropIntent,
  WorkspaceOfferContext
} from '../utils/interaction/drag-preview.utils.js';
import type { WorkspaceLayout } from '../utils/model/layout.utils.js';
import type { WorkspacePlacementPlanner } from '../utils/placement/planner.utils.js';
import type { WorkspaceMeasurementChange, WorkspaceMeasurements } from '../utils/presentation/measurements.utils.js';
import type { WorkspaceEvaluation } from '../utils/evaluation.utils.js';

export interface WorkspaceRearrangeCapabilities {
  rearrangeable: boolean;
  groupable: boolean;
}

type WorkspaceRearrangeHost = HTMLElement &
  ReactiveControllerHost & {
    readonly rearrangeable: boolean;
    readonly groupable: boolean;
    readonly detachThreshold: number;
  };

interface WorkspaceRearrangeDelegate {
  readonly evaluateWithContext: <T>(work: (evaluation: WorkspaceEvaluation) => T) => T;
  readonly isRearrangementAllowed: () => boolean;
  readonly getLayout: () => WorkspaceLayout | undefined;
  readonly getAvailablePanels: () => string[];
  readonly getMeasurements: () => WorkspaceMeasurements;
  readonly activateSource: (source: string[], group: boolean) => void;
  readonly applyPreview: (preview: WorkspaceDragPreview | undefined) => void;
  readonly commitPlacement: (
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
  controlRect: Rect;
  initialCue: WorkspaceDragCue;
  detachThreshold: number;
  initialAllocation: WorkspaceDragAllocation;
  initialPlacement?: { intent: WorkspaceDropIntent; offer: WorkspaceDragOffer };
  restoreScroll?: () => void;
  restoreFocus?: () => void;
}

type AttachedSession = SessionOrigin & {
  phase: 'attached';
  point: Point;
  preview: AttachedPreview;
};

type DetachedSession = SessionOrigin & {
  phase: 'detached';
  point: Point;
  preview: DetachedPreview;
  lastFeasible: DetachedPreview;
  pendingFrame?: number;
  pendingInput: boolean;
  pendingRefresh: boolean;
  initialPaint: boolean;
};

type WorkspaceRearrangeControllerSession = (SessionOrigin & { phase: 'pressed' }) | AttachedSession | DetachedSession;

export class WorkspaceRearrangeController {
  readonly #host: WorkspaceRearrangeHost;

  readonly #delegate: WorkspaceRearrangeDelegate;

  readonly #gesture: GestureController;

  #session?: WorkspaceRearrangeControllerSession;

  #planner?: WorkspacePlacementPlanner;

  #document?: Document;

  #suppressClick = false;

  #cursor?: { value: string; priority: string; owned: string };

  #pendingRecovery?: SessionOrigin;

  constructor(host: WorkspaceRearrangeHost, delegate: WorkspaceRearrangeDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    this.#gesture = new GestureController(host, {
      claimPriority: 'descendant-first',
      suppressNativeDrag: true,
      shouldIgnoreEvent: event => {
        const control = this.#findDragControl(event);
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

  getPreviewHint(preview: WorkspaceDragPreview, evaluation: WorkspaceEvaluation) {
    if (preview.phase !== 'detached' || !preview.point) return undefined;

    return decidePlacement({
      ...evaluation.targetCatalog(preview.source),
      preview,
      source: preview.source,
      point: preview.point,
      local: preview.intent,
      header: false,
      currentLayout: this.#delegate.getLayout() ?? { version: 1, root: null, closed: [] },
      available: evaluation.available,
      projectLayout: evaluation.projectLayout,
      planPlacement: this.#planner
    }).hint;
  }

  handleMeasurementsChange(change: WorkspaceMeasurementChange) {
    if (change.spaceChanged) {
      this.cancel();
    } else {
      this.refresh();
    }
  }

  refresh() {
    const session = this.#session;
    if (!session || session.phase === 'pressed') return;
    if (session.phase === 'attached') {
      session.initialCue = this.#createInitialCue(session.source, session.group);
      session.preview = { ...session.preview, cue: session.initialCue };
      this.#delegate.applyPreview(session.preview);
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
    if (session.phase === 'detached') {
      this.#cancelFrame(session);
    }
    this.#restoreCursor();
    this.#session = undefined;
    this.#suppressClick = true;
    const recovery = session;
    this.#pendingRecovery = recovery;
    const completion = this.#returnToOrigin(session);
    session.restoreScroll?.();
    void this.#completeReturnPreview(completion, recovery);
  }

  cancel() {
    this.#restoreCursor();
    this.#pendingRecovery = undefined;
    this.#suppressClick ||= this.#session !== undefined && this.#session.phase !== 'pressed';
    if (this.#session?.phase === 'detached') {
      this.#cancelFrame(this.#session);
    }
    this.#session = undefined;
    this.#planner = undefined;
    this.#delegate.applyPreview(undefined);
  }

  #refreshSelected(session: DetachedSession) {
    const refresh = (preview: DetachedPreview): DetachedPreview => {
      const offer = this.#getPlacementOffer(session.source, preview.intent, { selected: preview });
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
    const sharesPreview = session.lastFeasible === session.preview;
    session.lastFeasible = refresh(session.lastFeasible);
    session.preview = sharesPreview ? session.lastFeasible : refresh(session.preview);
  }

  #freshPointer = () => {
    if (this.#pendingRecovery) {
      this.cancel();
    }
    this.#suppressClick = false;
  };

  #keydown = (event: KeyboardEvent) => {
    if (this.#pendingRecovery && event.key !== 'Escape' && !event.repeat) {
      this.cancel();
    }
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
    ) {
      return;
    }
    if (previous.value) {
      this.#host.style.setProperty('cursor', previous.value, previous.priority);
    } else {
      this.#host.style.removeProperty('cursor');
    }
  }

  #findDragControl(event: Event): HTMLElement | undefined {
    return event
      .composedPath()
      .find(
        (item): item is HTMLElement =>
          item instanceof HTMLElement &&
          item.getRootNode() === this.#host.shadowRoot &&
          (item.hasAttribute('data-panel') || item.hasAttribute('data-drag-group'))
      );
  }

  #getCapabilities(): WorkspaceRearrangeCapabilities {
    return { rearrangeable: this.#host.rearrangeable, groupable: this.#host.groupable };
  }

  #allowsDrag(control: HTMLElement | undefined, capabilities = this.#getCapabilities()): boolean {
    return (
      !!control &&
      this.#delegate.isRearrangementAllowed() &&
      capabilities.rearrangeable &&
      (capabilities.groupable || control.localName !== 'nve-tabs-item')
    );
  }

  #getDragSource(control: HTMLElement): string[] | undefined {
    const layout = this.#delegate.getLayout();
    if (control.dataset.panel) {
      return getWorkspacePanelSource({
        layout,
        anchor: control.dataset.panel,
        available: this.#delegate.getAvailablePanels()
      });
    }
    return control.dataset.dragGroup
      ? [...(findGroup(layout?.root ?? null, control.dataset.dragGroup)?.panels ?? [])]
      : undefined;
  }

  #input = (event: CustomEvent<GestureInput>) => {
    if (event.target !== this.#host) return;
    const input = event.detail;
    if (input.kind === 'pointerdown') {
      this.#start(input);
    } else if (input.kind === 'pointerend') {
      this.#end(input);
    }
  };

  #start(input: Extract<GestureInput, { kind: 'pointerdown' }>) {
    const control = this.#findDragControl(input.event);
    if (!control) return;
    const capabilities = this.#getCapabilities();
    const source = this.#getDragSource(control);
    if (
      !source ||
      !this.#allowsDrag(control, capabilities) ||
      input.event.button !== 0 ||
      !input.event.isPrimary ||
      this.#session
    ) {
      return;
    }
    if (!input.claim({ kind: 'drag' })) return;
    this.#suppressClick = false;
    const threshold = this.#host.detachThreshold;
    const initialCue = this.#createInitialCue(source, control.hasAttribute('data-drag-group'));
    const layout = this.#delegate.getLayout();
    if (layout) {
      this.#planner = createWorkspacePlacementPlanner();
    }
    this.#session = {
      source,
      phase: 'pressed',
      capabilities,
      initialAllocation: { allocation: 'committed' },
      initialPlacement: layout
        ? createInitialReservation({
            layout,
            source,
            cue: initialCue,
            available: this.#delegate.getAvailablePanels(),
            evaluate: intent => this.#getPlacementOffer(source, intent)
          })
        : undefined,
      detachThreshold: nonnegativeFiniteOr(threshold, 48),
      group: control.hasAttribute('data-drag-group'),
      controlRect: control.getBoundingClientRect(),
      initialCue,
      restoreScroll: captureTabScroll(this.#host)
    };
  }

  #createInitialCue(source: string[], groupDrag: boolean): WorkspaceDragCue {
    return this.#delegate.evaluateWithContext(evaluation => {
      const layout = this.#delegate.getLayout() ?? { version: 1, root: null, closed: [] };
      const measurements = this.#delegate.getMeasurements();
      return getInitialDragCue({
        groups: evaluation.geometry(evaluation.project(layout)).groups,
        source,
        groupDrag,
        bounds: evaluation.bounds(),
        client: rect => evaluation.client(rect),
        measurements,
        width: group => getAllocatedTabWidth(group, measurements),
        scroll: group => evaluation.scroll(group)
      });
    });
  }

  #getPlacementOffer(
    source: string[],
    intent: WorkspaceDropIntent,
    context?: WorkspaceOfferContext
  ): WorkspaceDragOffer | undefined {
    return this.#delegate.evaluateWithContext(evaluation => {
      const layout = this.#delegate.getLayout();
      if (!layout || intent.kind === 'invalid') return undefined;

      return evaluatePlacementOffer({
        evaluation,
        layout,
        measurements: this.#delegate.getMeasurements(),
        source,
        intent,
        context,
        planner: this.#planner,
        groupable: this.#session?.capabilities.groupable ?? this.#host.groupable,
        currentRegions: () => evaluation.presentationGeometry().regions
      });
    });
  }

  #end(input: Extract<GestureInput, { kind: 'pointerend' }>) {
    const session = this.#session;
    if (!session) return;
    if (input.interrupted || input.reason !== 'up') {
      this.cancelForUser();
      return;
    }
    if (session.phase === 'detached' && !this.#prepareDrop(session)) {
      if (this.#session === session) {
        this.cancelForUser();
      }
      return;
    }
    this.#completeInteraction(session, input);
  }

  #completeInteraction(
    session: WorkspaceRearrangeControllerSession,
    input: Extract<GestureInput, { kind: 'pointerend' }>
  ) {
    const committed = session.phase === 'detached' ? this.#drop(session) : false;
    if (session.phase === 'pressed') {
      this.#activate(session, input);
    }
    this.#suppressClick = true;
    this.cancel();
    if (session.phase !== 'pressed') {
      this.#recoverAfterDrop(session, committed);
    }
  }

  #prepareDrop(session: DetachedSession) {
    this.#cancelFrame(session);
    session.initialPaint = false;
    this.#flushPending(session);
    return this.#session === session && !session.preview.blocked;
  }

  #returnToOrigin(session: AttachedSession | DetachedSession) {
    const preview: WorkspaceDragPreview = {
      source: session.source,
      ...session.initialAllocation,
      phase: session.phase === 'attached' ? 'returning-attached' : 'returning-detached',
      intent: { kind: 'invalid' },
      cue: this.#createInitialCue(session.source, session.group),
      blocked: false
    };
    this.#planner = undefined;
    this.#delegate.applyPreview(preview);
    return this.#settlePreviewReturn(session);
  }

  async #settlePreviewReturn(session: SessionOrigin) {
    await this.#host.updateComplete;
    if (this.#pendingRecovery !== session) return;
    const ghost = this.#host.shadowRoot?.querySelector('[data-destination-ghost]');
    if (!ghost) return;
    ghost.getBoundingClientRect();
    await Promise.allSettled(ghost.getAnimations().map(animation => animation.finished));
  }

  async #completeReturnPreview(completion: Promise<void>, session: SessionOrigin) {
    await completion;
    if (this.#pendingRecovery !== session) return;

    this.#delegate.applyPreview(undefined);
    void this.#completeRecovery(session);
  }

  #recoverAfterDrop(session: SessionOrigin, committed: boolean) {
    this.#pendingRecovery = session;
    if (!committed) {
      session.restoreScroll?.();
    }
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
      ? this.#delegate.commitPlacement(
          session.source,
          intent,
          session.preview.allocation === 'reserved' ? session.preview.layout : undefined
        )
      : false;
  }

  #activate(
    session: { source: string[]; group: boolean; controlRect: Rect },
    input: Extract<GestureInput, { kind: 'pointerend' }>
  ) {
    const rect = session.controlRect;
    if (
      input.clientX >= rect.x &&
      input.clientX <= rect.x + rect.width &&
      input.clientY >= rect.y &&
      input.clientY <= rect.y + rect.height
    ) {
      this.#delegate.activateSource(session.source, session.group);
    }
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
      restoreFocus: session.phase === 'pressed' ? captureWorkspaceFocus(this.#host) : session.restoreFocus,
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
    if (distance >= session.detachThreshold) {
      this.#detach(attached);
    } else {
      this.#session = attached;
      this.#delegate.applyPreview(attached.preview);
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
    this.#delegate.applyPreview(preview);
    this.#requestFrame(session);
  }

  #queueInput(session: DetachedSession, point: Point) {
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
    if (session.pendingFrame !== undefined) {
      cancelAnimationFrame(session.pendingFrame);
    }
    session.pendingFrame = undefined;
  }

  #flushPending(session: DetachedSession) {
    const pointerPending = session.pendingInput;
    const refreshPending = session.pendingRefresh;
    session.pendingInput = false;
    session.pendingRefresh = false;
    if (refreshPending) {
      this.#refreshSelected(session);
    }
    if (this.#session !== session) return;
    if (pointerPending) {
      this.#offerAt(session, session.point);
    } else if (refreshPending) {
      this.#publish(session.preview);
    }
  }

  #offerAt(session: DetachedSession, point: Point) {
    this.#delegate.evaluateWithContext(evaluation => this.#evaluateOffer(session, point, evaluation));
  }

  #evaluateOffer(session: DetachedSession, point: Point, evaluation: WorkspaceEvaluation) {
    const layout = this.#delegate.getLayout();
    const { intent, acquisition } = decidePointerPlacement({
      placement: evaluation.getPlacementCatalog(session.source, point),
      canonicalRoot: layout?.root ?? null,
      currentLayout: layout ?? { version: 1, root: null, closed: [] },
      source: session.source,
      point,
      heldIntent: session.preview.intent,
      groupable: session.capabilities.groupable,
      gap: this.#delegate.getMeasurements().gap,
      available: evaluation.available,
      projectLayout: evaluation.projectLayout,
      planPlacement: this.#planner
    });
    if (!intent) {
      this.#showLastFeasible(session, point);
      return;
    }
    const offer = this.#getPlacementOffer(session.source, intent, {
      selected: session.preview,
      acquisition: acquisition ? { ...acquisition, point } : undefined
    });
    if (!offer) {
      session.preview = { ...session.preview, point };
      this.#delegate.applyPreview(session.preview);
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
    if (feasible) {
      session.lastFeasible = session.preview;
    }
    this.#publish(session.preview);
  }

  #showLastFeasible(session: DetachedSession, point: Point) {
    this.#setCursor(session.lastFeasible.blocked ? 'no-drop' : 'grabbing');
    session.preview = { ...session.lastFeasible, point };
    this.#delegate.applyPreview(session.preview);
  }

  #publish(preview: DetachedPreview) {
    this.#setCursor(preview.blocked ? 'no-drop' : 'grabbing');
    this.#delegate.applyPreview(preview);
  }
}
