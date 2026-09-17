// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveControllerHost } from 'lit';

const GESTURE_EVENT_TYPES = [
  'contextmenu',
  'dragstart',
  'lostpointercapture',
  'pointercancel',
  'pointerdown',
  'pointermove',
  'pointerup',
  'selectstart',
  'wheel'
] as const;

const WHEEL_LINE_PIXELS = 16;

interface PointerState {
  clientX: number;
  clientY: number;
  gestureKind: PointerClaimOptions['kind'];
  movementX: number;
  movementY: number;
  pinchCandidate: boolean;
  readonly pointerType: string;
  readonly startClientX: number;
  readonly startClientY: number;
}

export interface PointerClaimOptions {
  readonly kind?: 'drag' | 'pan';
  readonly pinchCandidate?: boolean;
}

export interface PinchStartDecision<TContext> {
  readonly context: TContext;
}

/** Coordinates and deltas use CSS pixels; movement is sample-relative and total displacement is start-relative. */
export interface PointerMovementGesture {
  readonly event: PointerEvent;
  readonly clientX: number;
  readonly clientY: number;
  readonly movementX: number;
  readonly movementY: number;
  readonly startClientX: number;
  readonly startClientY: number;
  readonly totalDisplacementX: number;
  readonly totalDisplacementY: number;
}

export interface PinchStart {
  readonly firstPointerId: number;
  readonly firstPointerType: string;
  readonly firstStartClientX: number;
  readonly firstStartClientY: number;
  readonly secondPointerId: number;
  readonly secondPointerType: string;
  readonly secondStartClientX: number;
  readonly secondStartClientY: number;
  readonly startCenterClientX: number;
  readonly startCenterClientY: number;
}

export interface PinchGesture<TContext> extends PinchStart {
  readonly kind: 'pinch';
  readonly event: PointerEvent;
  readonly context: TContext;
  /** Current pointer distance divided by the starting pointer distance. */
  readonly scale: number;
  readonly centerClientX: number;
  readonly centerClientY: number;
}

/**
 * Per-event wheel input normalized to CSS pixels.
 *
 * Modifier-assisted trackpad pinch remains wheel input: consumers can classify it using the native event's
 * `ctrlKey` or `metaKey` without conflating it with the start-relative lifecycle of a two-pointer pinch.
 */
export interface WheelGesture {
  readonly kind: 'wheel';
  readonly event: WheelEvent;
  readonly clientX: number;
  readonly clientY: number;
  readonly deltaX: number;
  readonly deltaY: number;
}

export type PointerEndReason = 'up' | 'cancel' | 'lost-capture' | 'buttons-released';

export interface PointerEndGesture extends PointerMovementGesture {
  readonly kind: 'pointerend';
  /** Whether the pointer session ended without an observed physical release. */
  readonly interrupted: boolean;
  readonly reason: PointerEndReason;
}

export type Gesture<TPinchContext> =
  | (PointerMovementGesture & { readonly kind: 'drag' })
  | (PointerMovementGesture & { readonly kind: 'pan' })
  | PinchGesture<TPinchContext>;

export interface PointerDownInput {
  readonly event: PointerEvent;
  readonly kind: 'pointerdown';
  /**
   * Claims this pointer sequence once during the synchronous input dispatch and suppresses native text selection for
   * its lifetime; returns `false` after that window.
   */
  readonly claim: (options?: PointerClaimOptions) => boolean;
}

export interface WheelGestureInput extends WheelGesture {
  /** Claims and prevents this wheel event during the synchronous input dispatch; returns `false` afterward. */
  readonly claim: () => boolean;
}

/** Claimable starts, claimed pointer terminals, and normalized claimable wheel input. */
export type GestureInput = PointerDownInput | PointerEndGesture | WheelGestureInput;

/** Precedence policy for claims among nested GestureController targets. */
export type GestureClaimPriority = 'self-first' | 'descendant-first';

export interface GestureControllerOptions<TPinchContext = undefined> {
  /**
   * Skips admission of a new pointer sequence or a stateless native event.
   * The controller does not consult it again after a pointerdown claim.
   */
  readonly shouldIgnoreEvent?: (event: Event) => boolean;
  /**
   * Consulted once when the controller first observes two claimed pinch candidates.
   * Returning `undefined` declines that pair; otherwise the controller retains the context for its pinch lifetime.
   * The pair remains locked until fewer than two pinch candidates remain.
   */
  readonly beginPinch?: (start: PinchStart) => PinchStartDecision<TPinchContext> | undefined;
  /** Consulted independently for each context-menu event. */
  readonly shouldPreventContextMenu?: (event: MouseEvent) => boolean;
  /**
   * Determines precedence among nested GestureController targets.
   *
   * `self-first` is appropriate for a dedicated interaction surface.
   * `descendant-first` lets nested controllers claim input before this controller.
   *
   * Defaults to `self-first`.
   */
  readonly claimPriority?: GestureClaimPriority;
  /**
   * Consulted during native pointerdown capture before descendant handlers.
   *
   * Returning true calls preventDefault() on the pointerdown, but does not
   * claim the pointer, capture it, stop propagation, create pointer state,
   * suppress selection, or start a gesture.
   *
   * This is meaningful with `claimPriority: 'descendant-first'`. It lets an
   * activated higher-level interaction mode reserve a sequence for ordinary
   * target-phase application code while preserving nested GestureController
   * claim priority.
   */
  readonly shouldReservePointerDown?: (event: PointerEvent) => boolean;
  /** Prevents native HTML drag competition on a dedicated interaction surface. */
  readonly suppressNativeDrag?: boolean;
  /**
   * Inline `touch-action` for a dedicated interaction surface. The controller reevaluates a callback after host updates.
   * Restores the target's prior inline value afterward.
   * Avoid applying it to a general root that contains native interactive content.
   */
  readonly touchAction?: string | (() => string | undefined);
}

interface PinchPair {
  readonly firstPointerId: number;
  readonly secondPointerId: number;
}

interface PendingPinchState extends PinchPair {
  readonly status: 'pending';
}

interface DeclinedPinchState extends PinchPair {
  readonly status: 'declined';
}

interface ActivePinchState<TPinchContext> extends PinchPair, PinchStart {
  readonly context: TPinchContext;
  readonly distance: number;
  readonly status: 'active';
}

type PinchState<TPinchContext> = PendingPinchState | DeclinedPinchState | ActivePinchState<TPinchContext>;

interface TouchActionState {
  readonly applied: string;
  readonly priority: string;
  readonly target: HTMLElement;
  readonly value: string;
}

interface UserSelectState {
  readonly applied: string;
  readonly appliedPriority: string;
  readonly priority: string;
  readonly target: HTMLElement;
  readonly value: string;
}

class SynchronousClaim<TOptions = void> {
  #action?: (options?: TOptions) => void;

  constructor(action: (options?: TOptions) => void) {
    this.#action = action;
  }

  readonly claim = (options?: TOptions): boolean => {
    const action = this.#action;
    if (!action) return false;
    this.#action = undefined;
    action(options);
    return true;
  };

  close(): void {
    this.#action = undefined;
  }
}

type GestureHost = EventTarget & ReactiveControllerHost;

/**
 * Normalizes claimable platform pointer and wheel input on a dynamically assigned target.
 * A pointer claim owns native input competition for its lifetime: the controller prevents claimed movement and text
 * selection, and can suppress native drag when configured.
 */
export class GestureController<TPinchContext = undefined> implements ReactiveController {
  readonly #host: GestureHost;
  readonly #options: GestureControllerOptions<TPinchContext>;
  readonly #pointerStates = new Map<number, PointerState>();
  #connected = false;
  #pinch?: PinchState<TPinchContext>;
  #target?: HTMLElement;
  #touchActionState?: TouchActionState;
  #userSelectState?: UserSelectState;

  constructor(host: GestureHost, options: GestureControllerOptions<TPinchContext>) {
    this.#host = host;
    this.#options = options;
    host.addController(this);
  }

  set target(target: HTMLElement | undefined) {
    if (target === this.#target) return;
    this.#removeTargetListeners();
    this.#resetGestureState();
    this.#target = target;
    this.#addTargetListeners();
  }

  hostConnected(): void {
    this.#connected = true;
    this.#addTargetListeners();
  }

  hostDisconnected(): void {
    this.#removeTargetListeners();
    this.#resetGestureState();
    this.#connected = false;
  }

  hostUpdated(): void {
    this.#syncTouchAction();
  }

  #addTargetListeners(): void {
    const target = this.#target;
    if (!this.#connected || !target) return;
    const capture = this.#options.claimPriority !== 'descendant-first';
    for (const type of GESTURE_EVENT_TYPES) target.addEventListener(type, this.#handleEvent, capture);
    if (this.#shouldListenForPointerDownReservation()) {
      target.addEventListener('pointerdown', this.#handlePointerDownReservation, true);
    }
    this.#applyTouchAction(target);
  }

  #removeTargetListeners(): void {
    const target = this.#target;
    if (!this.#connected || !target) return;
    const capture = this.#options.claimPriority !== 'descendant-first';
    for (const type of GESTURE_EVENT_TYPES) target.removeEventListener(type, this.#handleEvent, capture);
    if (this.#shouldListenForPointerDownReservation()) {
      target.removeEventListener('pointerdown', this.#handlePointerDownReservation, true);
    }
    this.#restoreTouchAction();
  }

  #shouldListenForPointerDownReservation(): boolean {
    return this.#options.claimPriority === 'descendant-first' && this.#options.shouldReservePointerDown !== undefined;
  }

  #handlePointerDownReservation = (event: PointerEvent): void => {
    const target = this.#target;
    if (
      !target ||
      event.currentTarget !== target ||
      event.defaultPrevented ||
      this.#options.shouldIgnoreEvent?.(event)
    ) {
      return;
    }
    if (this.#options.shouldReservePointerDown?.(event)) event.preventDefault();
  };

  #handleEvent = (event: Event): void => {
    const target = this.#target;
    if (!target || event.currentTarget !== target) return;
    if (event.type === 'contextmenu' && event instanceof MouseEvent) {
      this.#handleContextMenu(event);
      return;
    }
    if (event.type === 'selectstart') {
      this.#handleSelectStart(event);
      return;
    }
    if (event instanceof WheelEvent) {
      this.#handleWheel(event);
      return;
    }
    if (event instanceof PointerEvent) {
      this.#handlePointerEvent(event);
      return;
    }
    this.#handleNativeDrag(event);
  };

  #handleNativeDrag(event: Event): void {
    if (event.type !== 'dragstart' || this.#options.shouldIgnoreEvent?.(event)) return;
    if (this.#options.suppressNativeDrag) event.preventDefault();
  }

  #handleContextMenu(event: MouseEvent): void {
    if (this.#options.shouldIgnoreEvent?.(event)) return;
    if (this.#options.shouldPreventContextMenu?.(event)) event.preventDefault();
  }

  #handleSelectStart(event: Event): void {
    if (this.#pointerStates.size > 0) event.preventDefault();
  }

  #handlePointerEvent(event: PointerEvent): void {
    const reason = getPointerEndReason(event);
    if (reason !== undefined) {
      if (this.#pointerStates.has(event.pointerId)) this.#endPointer(event, reason);
      return;
    }
    if (event.type === 'pointerdown') {
      if (!this.#options.shouldIgnoreEvent?.(event)) this.#handlePointerDown(event);
    } else if (event.type === 'pointermove' && this.#pointerStates.has(event.pointerId)) {
      this.#handlePointerMove(event);
    }
  }

  #handleWheel(event: WheelEvent): void {
    const target = this.#target;
    if (!target || this.#options.shouldIgnoreEvent?.(event)) return;
    const pageBounds = event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? target.getBoundingClientRect() : undefined;
    const deltaX = normalizeWheelDelta(event.deltaX, event.deltaMode, pageBounds?.width);
    const deltaY = normalizeWheelDelta(event.deltaY, event.deltaMode, pageBounds?.height);
    const claimWindow = new SynchronousClaim(() => {
      event.preventDefault();
      event.stopPropagation();
    });
    try {
      this.#dispatchGestureInput({
        claim: claimWindow.claim,
        clientX: event.clientX,
        clientY: event.clientY,
        deltaX,
        deltaY,
        event,
        kind: 'wheel'
      });
    } finally {
      claimWindow.close();
    }
  }

  #handlePointerDown(event: PointerEvent): void {
    const claimWindow = new SynchronousClaim<PointerClaimOptions>(options => {
      this.#pointerStates.set(event.pointerId, {
        clientX: event.clientX,
        clientY: event.clientY,
        gestureKind: options?.kind,
        movementX: 0,
        movementY: 0,
        pinchCandidate: options?.pinchCandidate ?? false,
        pointerType: event.pointerType,
        startClientX: event.clientX,
        startClientY: event.clientY
      });
      const target = this.#target;
      if (target) this.#applyUserSelect(target);
      event.stopPropagation();
      this.#capturePointer(event.pointerId);
    });
    try {
      this.#dispatchGestureInput({ claim: claimWindow.claim, event, kind: 'pointerdown' });
    } finally {
      claimWindow.close();
    }
    this.#startPinchIfNeeded();
  }

  #handlePointerMove(event: PointerEvent): void {
    const pointerState = this.#updatePointerPosition(event);
    if (!pointerState) return;
    event.stopPropagation();
    if (pointerState.movementX === 0 && pointerState.movementY === 0) return;
    if (this.#pointerStates.size >= 2 && this.#handlePinch(event)) return;
    if (pointerState.gestureKind === undefined) return;
    event.preventDefault();
    this.#dispatchPointerMovementGesture(event, pointerState, pointerState.gestureKind);
  }

  #updatePointerPosition(event: PointerEvent): PointerState | undefined {
    const pointerState = this.#pointerStates.get(event.pointerId);
    if (!pointerState) return undefined;
    pointerState.movementX = calculateDisplacement(event.clientX, pointerState.clientX);
    pointerState.movementY = calculateDisplacement(event.clientY, pointerState.clientY);
    pointerState.clientX = event.clientX;
    pointerState.clientY = event.clientY;
    return pointerState;
  }

  #dispatchPointerMovementGesture(event: PointerEvent, pointerState: PointerState, kind: 'drag' | 'pan'): void {
    this.#dispatchGesture({
      clientX: pointerState.clientX,
      clientY: pointerState.clientY,
      event,
      kind,
      movementX: pointerState.movementX,
      movementY: pointerState.movementY,
      startClientX: pointerState.startClientX,
      startClientY: pointerState.startClientY,
      totalDisplacementX: calculateDisplacement(pointerState.clientX, pointerState.startClientX),
      totalDisplacementY: calculateDisplacement(pointerState.clientY, pointerState.startClientY)
    });
  }

  #endPointer(event: PointerEvent, reason: PointerEndReason): void {
    const pointerState = this.#pointerStates.get(event.pointerId);
    if (!pointerState) return;
    const interrupted = isPointerEndInterrupted(reason);
    const clientX = interrupted ? pointerState.clientX : event.clientX;
    const clientY = interrupted ? pointerState.clientY : event.clientY;
    event.stopPropagation();
    this.#dispatchGestureInput({
      clientX,
      clientY,
      event,
      interrupted,
      kind: 'pointerend',
      movementX: calculateDisplacement(clientX, pointerState.clientX),
      movementY: calculateDisplacement(clientY, pointerState.clientY),
      startClientX: pointerState.startClientX,
      startClientY: pointerState.startClientY,
      totalDisplacementX: calculateDisplacement(clientX, pointerState.startClientX),
      totalDisplacementY: calculateDisplacement(clientY, pointerState.startClientY),
      reason
    });
    this.#pointerStates.delete(event.pointerId);
    if (this.#pointerStates.size === 0) this.#restoreUserSelect();
    if (this.#countPinchCandidates() < 2) this.#pinch = undefined;
  }

  #handlePinch(event: PointerEvent): boolean {
    this.#startPinchIfNeeded();
    this.#beginPendingPinchIfPossible();
    const pinch = this.#pinch;
    const pointerState = this.#pointerStates.get(event.pointerId);
    if (!pinch || !pointerState?.pinchCandidate) return false;
    const isPairPointer = event.pointerId === pinch.firstPointerId || event.pointerId === pinch.secondPointerId;
    if (pinch.status === 'pending') return true;
    if (pinch.status === 'declined') return !isPairPointer;
    if (!isPairPointer) return true;
    return this.#dispatchActivePinch(event, pinch);
  }

  #dispatchActivePinch(event: PointerEvent, pinch: ActivePinchState<TPinchContext>): boolean {
    const first = this.#pointerStates.get(pinch.firstPointerId);
    const second = this.#pointerStates.get(pinch.secondPointerId);
    if (!first || !second) return true;
    const distance = calculatePointerDistance(first, second);
    if (distance <= 0) return true;
    const centerClientX = calculateMidpoint(first.clientX, second.clientX);
    const centerClientY = calculateMidpoint(first.clientY, second.clientY);
    event.preventDefault();
    this.#dispatchGesture({
      centerClientX,
      centerClientY,
      context: pinch.context,
      event,
      firstPointerId: pinch.firstPointerId,
      firstPointerType: pinch.firstPointerType,
      firstStartClientX: pinch.firstStartClientX,
      firstStartClientY: pinch.firstStartClientY,
      kind: 'pinch',
      scale: distance / pinch.distance,
      secondPointerId: pinch.secondPointerId,
      secondPointerType: pinch.secondPointerType,
      secondStartClientX: pinch.secondStartClientX,
      secondStartClientY: pinch.secondStartClientY,
      startCenterClientX: pinch.startCenterClientX,
      startCenterClientY: pinch.startCenterClientY
    });
    return true;
  }

  #startPinchIfNeeded(): void {
    const beginPinch = this.#options.beginPinch;
    if (this.#pinch || this.#pointerStates.size < 2 || !beginPinch) return;
    let firstPointerId: number | undefined;
    let secondPointerId: number | undefined;
    for (const pointerId of this.#pointerStates.keys()) {
      if (!this.#pointerStates.get(pointerId)?.pinchCandidate) continue;
      if (firstPointerId === undefined) firstPointerId = pointerId;
      else {
        secondPointerId = pointerId;
        break;
      }
    }
    if (firstPointerId === undefined || secondPointerId === undefined) return;
    this.#pinch = { firstPointerId, secondPointerId, status: 'pending' };
    this.#beginPendingPinchIfPossible();
  }

  #beginPendingPinchIfPossible(): void {
    const pinch = this.#pinch;
    const beginPinch = this.#options.beginPinch;
    if (pinch?.status !== 'pending' || !beginPinch) return;
    const first = this.#pointerStates.get(pinch.firstPointerId);
    const second = this.#pointerStates.get(pinch.secondPointerId);
    if (!first || !second) return;
    const distance = calculatePointerDistance(first, second);
    if (distance <= 0) return;
    const start: PinchStart = {
      firstPointerId: pinch.firstPointerId,
      firstPointerType: first.pointerType,
      firstStartClientX: first.startClientX,
      firstStartClientY: first.startClientY,
      secondPointerId: pinch.secondPointerId,
      secondPointerType: second.pointerType,
      secondStartClientX: second.startClientX,
      secondStartClientY: second.startClientY,
      startCenterClientX: calculateMidpoint(first.clientX, second.clientX),
      startCenterClientY: calculateMidpoint(first.clientY, second.clientY)
    };
    const decision = beginPinch(start);
    if (!decision) {
      this.#pinch = {
        firstPointerId: pinch.firstPointerId,
        secondPointerId: pinch.secondPointerId,
        status: 'declined'
      };
      return;
    }
    this.#pinch = {
      context: decision.context,
      distance,
      status: 'active',
      ...start
    };
  }

  #countPinchCandidates(): number {
    let count = 0;
    for (const pointerState of this.#pointerStates.values()) {
      if (pointerState.pinchCandidate) count += 1;
    }
    return count;
  }

  #capturePointer(pointerId: number): void {
    try {
      this.#target?.setPointerCapture?.(pointerId);
    } catch {
      // Synthetic test events and browser implementations may not have an active pointer to capture.
    }
  }

  #applyTouchAction(target: HTMLElement): void {
    const touchAction = this.#getTouchAction();
    if (touchAction === undefined) return;
    this.#touchActionState = {
      applied: touchAction,
      priority: target.style.getPropertyPriority('touch-action'),
      target,
      value: target.style.getPropertyValue('touch-action')
    };
    target.style.setProperty('touch-action', touchAction);
  }

  #restoreTouchAction(): void {
    const state = this.#touchActionState;
    this.#touchActionState = undefined;
    if (!state || state.target.style.getPropertyValue('touch-action') !== state.applied) return;
    if (state.value) {
      state.target.style.setProperty('touch-action', state.value, state.priority);
    } else {
      state.target.style.removeProperty('touch-action');
    }
  }

  #syncTouchAction(): void {
    const target = this.#target;
    if (!this.#connected || !target) return;
    const touchAction = this.#getTouchAction();
    if (touchAction === this.#touchActionState?.applied) return;
    this.#restoreTouchAction();
    if (touchAction !== undefined) this.#applyTouchAction(target);
  }

  #getTouchAction(): string | undefined {
    const touchAction = this.#options.touchAction;
    return typeof touchAction === 'function' ? touchAction() : touchAction;
  }

  #applyUserSelect(target: HTMLElement): void {
    if (this.#userSelectState) return;
    const applied = 'none';
    const appliedPriority = '';
    this.#userSelectState = {
      applied,
      appliedPriority,
      priority: target.style.getPropertyPriority('user-select'),
      target,
      value: target.style.getPropertyValue('user-select')
    };
    target.style.setProperty('user-select', applied, appliedPriority);
  }

  #restoreUserSelect(): void {
    const state = this.#userSelectState;
    this.#userSelectState = undefined;
    if (
      !state ||
      state.target.style.getPropertyValue('user-select') !== state.applied ||
      state.target.style.getPropertyPriority('user-select') !== state.appliedPriority
    ) {
      return;
    }
    if (state.value) {
      state.target.style.setProperty('user-select', state.value, state.priority);
    } else {
      state.target.style.removeProperty('user-select');
    }
  }

  #dispatchGesture(gesture: Gesture<TPinchContext>): void {
    this.#host.dispatchEvent(
      new CustomEvent<Gesture<TPinchContext>>('nve-gesture', {
        bubbles: false,
        cancelable: false,
        composed: false,
        detail: gesture
      })
    );
  }

  #dispatchGestureInput(input: GestureInput): void {
    this.#host.dispatchEvent(
      new CustomEvent<GestureInput>('nve-gesture-input', {
        bubbles: false,
        cancelable: false,
        composed: false,
        detail: input
      })
    );
  }

  #resetGestureState(): void {
    this.#pointerStates.clear();
    this.#pinch = undefined;
    this.#restoreUserSelect();
  }
}

function calculateDisplacement(position: number, origin: number): number {
  return position - origin;
}

function calculateMidpoint(first: number, second: number): number {
  return (first + second) / 2;
}

function calculatePointerDistance(first: PointerState, second: PointerState): number {
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

function getPointerEndReason(event: PointerEvent): PointerEndReason | undefined {
  if (event.type === 'pointerup') return 'up';
  if (event.type === 'pointercancel') return 'cancel';
  if (event.type === 'lostpointercapture') return 'lost-capture';
  if (event.type === 'pointermove' && event.buttons === 0) return 'buttons-released';
  return undefined;
}

function isPointerEndInterrupted(reason: PointerEndReason): boolean {
  return reason === 'cancel' || reason === 'lost-capture';
}

function normalizeWheelDelta(delta: number, deltaMode: number, pagePixels = 1): number {
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) return delta * WHEEL_LINE_PIXELS;
  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) return delta * pagePixels;
  return delta;
}
