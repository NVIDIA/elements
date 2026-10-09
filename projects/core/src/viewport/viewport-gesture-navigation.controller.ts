// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  GestureController,
  KeyStateController,
  isImmediateRootActiveElement,
  type Gesture,
  type GestureInput,
  type PinchStart,
  type PointerEndGesture,
  type PointerMovementGesture,
  type WheelGestureInput
} from '@nvidia-elements/core/internal';
import type { ViewportPanBehavior, ViewportPoint, ViewportTransform } from './viewport.types.js';
import { anchoredTransform, contentPointFromViewport } from './viewport-projection.utils.js';

interface PointerPanSession {
  readonly button: number;
  readonly dragThreshold: number;
  lastTotalDisplacementX: number;
  lastTotalDisplacementY: number;
  state: 'pending' | 'active' | 'suppressed';
  exceededThreshold: boolean;
  readonly pointerType: string;
  transformStart: ViewportTransform;
  transformStartDisplacementX: number;
  transformStartDisplacementY: number;
}

interface PinchContext {
  readonly anchor: ViewportPoint;
  readonly start: ViewportTransform;
}

type ViewportGestureNavigationHost = HTMLElement &
  ReactiveControllerHost & {
    readonly _internals: ElementInternals;
    readonly behaviorPan: ViewportPanBehavior;
    readonly pannable: boolean;
    readonly zoomable: boolean;
    readonly dragThreshold: number;
  };

interface ViewportGestureNavigationDelegate {
  readonly clampScale: (value: number) => number;
  readonly clientToViewport: (clientX: number, clientY: number) => ViewportPoint;
  readonly getTransform: () => ViewportTransform;
  readonly applyPan: (next: ViewportTransform) => void;
  readonly applyZoom: (next: ViewportTransform) => void;
}

export class ViewportGestureNavigationController implements ReactiveController {
  readonly #host: ViewportGestureNavigationHost;
  readonly #delegate: ViewportGestureNavigationDelegate;
  readonly #gestureController: GestureController<PinchContext>;
  readonly #keyStateController: KeyStateController;
  readonly #pointerPanSessions = new Map<number, PointerPanSession>();
  readonly #suppressedClicks = new Map<
    number,
    { eventType: 'auxclick' | 'click'; timer: ReturnType<typeof setTimeout> }
  >();
  #connected = false;
  #clickListenersActive = false;
  #spaceKeyListenerTarget?: Window;
  #nativeInteractionHovered = false;
  #pinchPointerIds?: ReadonlySet<number>;

  constructor(host: ViewportGestureNavigationHost, delegate: ViewportGestureNavigationDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    host.addController(this);
    this.#gestureController = new GestureController(host, {
      beginPinch: this.#beginPinch,
      claimPriority: 'descendant-first',
      shouldIgnoreEvent: this.#shouldIgnoreEvent,
      shouldPreventContextMenu: this.#shouldPreventContextMenu,
      shouldReservePointerDown: this.#shouldReservePointerDown,
      suppressNativeDrag: true,
      touchAction: this.#getTouchAction
    });
    this.#keyStateController = new KeyStateController(host, { watchedCodes: ['Space'] });
  }

  hostConnected(): void {
    this.#connected = true;
    this.#host.addEventListener('nve-gesture', this.#handleGesture as EventListener);
    this.#host.addEventListener('nve-gesture-input', this.#handleGestureInput as EventListener);
    this.#host.addEventListener('blur', this.#handleBlur);
    this.#host.addEventListener('focus', this.#handleFocus);
    this.#host.addEventListener('pointerover', this.#handlePointerOver as EventListener);
    this.#syncBehaviorPolicy();
  }

  hostDisconnected(): void {
    this.#connected = false;
    this.#keyStateController.enabled = false;
    this.#gestureController.target = undefined;
    this.#host.removeEventListener('nve-gesture', this.#handleGesture as EventListener);
    this.#host.removeEventListener('nve-gesture-input', this.#handleGestureInput as EventListener);
    this.#host.removeEventListener('blur', this.#handleBlur);
    this.#host.removeEventListener('focus', this.#handleFocus);
    this.#host.removeEventListener('pointerover', this.#handlePointerOver as EventListener);
    this.#setClickListeners(false);
    this.#setSpaceKeyListener(false);
    this.#clearPointerState();
  }

  hostUpdated(): void {
    this.#syncBehaviorPolicy();
    this.#syncPanEligibleState();
  }

  rebasePointerSessions(): void {
    this.#rebasePointerPans();
  }

  #syncBehaviorPolicy(): void {
    const panBehavior = this.#host.behaviorPan;
    const behaviorEnabled = this.#host.pannable || this.#host.zoomable;
    const handlesClaimedPointers = this.#pointerPanSessions.size > 0;
    this.#keyStateController.enabled = this.#connected && panBehavior === 'space';
    this.#gestureController.target =
      this.#connected && (behaviorEnabled || handlesClaimedPointers) ? this.#host : undefined;
    this.#setSpaceKeyListener(this.#connected && panBehavior === 'space');
    this.#setClickListeners(this.#connected && (this.#host.pannable || this.#suppressedClicks.size > 0));
    this.#syncDisabledPanEligibility();
  }

  #syncDisabledPanEligibility(): void {
    if (this.#host.pannable) return;
    this.#nativeInteractionHovered = false;
    this.#host._internals?.states.delete('pan-eligible');
  }

  #handleGestureInput = (event: CustomEvent<GestureInput>): void => {
    const input = event.detail;
    if (input.kind === 'pointerdown') {
      this.#handlePointerDown(input);
    } else if (input.kind === 'pointerend') {
      this.#handlePointerEnd(input);
    } else {
      this.#handleWheel(input);
    }
  };

  #handlePointerDown(input: Extract<GestureInput, { kind: 'pointerdown' }>): void {
    const nativeEvent = input.event;
    this.#clearSuppressedClick(nativeEvent.pointerId);
    const isTouch = nativeEvent.pointerType === 'touch';
    const canPan = isTouch ? this.#host.pannable : this.#acceptsPointerPan(nativeEvent);
    const canPinch = isTouch && this.#host.zoomable;
    if (!canPan && !canPinch) return this.#focusSpaceViewportFromUnclaimedPointer(nativeEvent);
    const claimed = input.claim({ kind: canPan ? 'pan' : undefined, pinchCandidate: canPinch });
    if (!claimed) return;
    if (!isTouch) this.#host.focus({ preventScroll: true });
    if (nativeEvent.button === 1) nativeEvent.preventDefault();
    const start = this.#delegate.getTransform();
    this.#pointerPanSessions.set(nativeEvent.pointerId, {
      button: nativeEvent.button,
      dragThreshold: this.#host.dragThreshold,
      lastTotalDisplacementX: 0,
      lastTotalDisplacementY: 0,
      state: canPan ? 'pending' : 'suppressed',
      exceededThreshold: false,
      pointerType: nativeEvent.pointerType,
      transformStart: start,
      transformStartDisplacementX: 0,
      transformStartDisplacementY: 0
    });
  }

  #focusSpaceViewportFromUnclaimedPointer(event: PointerEvent): void {
    if (this.#host.behaviorPan !== 'space' || event.pointerType === 'touch' || event.button !== 0) return;
    this.#host.focus({ preventScroll: true });
  }

  #handlePointerEnd(input: PointerEndGesture): void {
    const pointerId = input.event.pointerId;
    const session = this.#pointerPanSessions.get(pointerId);
    const endedPinch = this.#endPinchIfNeeded(pointerId);
    if (session) this.#finishPointerPan(input, session, endedPinch);
    if (session && this.#pointerPanSessions.get(pointerId) === session) this.#pointerPanSessions.delete(pointerId);
    this.#syncPanningState();
    this.#syncBehaviorPolicy();
  }

  #endPinchIfNeeded(pointerId: number): boolean {
    if (!this.#pinchPointerIds?.has(pointerId)) return false;
    for (const [candidatePointerId, candidate] of this.#pointerPanSessions) {
      if (candidatePointerId !== pointerId && candidate.pointerType === 'touch') {
        this.#suppressPointerPan(candidate);
      }
    }
    this.#pinchPointerIds = undefined;
    return true;
  }

  #finishPointerPan(input: PointerEndGesture, session: PointerPanSession, endedPinch: boolean): void {
    if (session.exceededThreshold && !input.interrupted && !endedPinch) {
      this.#queueClickSuppression(input.event.pointerId, session);
    }
    this.#suppressPointerPan(session);
  }

  #handleWheel(input: WheelGestureInput): void {
    if (!isImmediateRootActiveElement(this.#host)) return;
    if (input.event.ctrlKey || input.event.metaKey) {
      this.#handleWheelZoom(input);
    } else {
      this.#handleWheelPan(input);
    }
  }

  #handleWheelZoom(input: WheelGestureInput): void {
    if (!this.#host.zoomable || !input.claim()) return;
    const start = this.#delegate.getTransform();
    const viewport = this.#delegate.clientToViewport(input.clientX, input.clientY);
    const anchor = contentPointFromViewport(viewport.x, viewport.y, start);
    const factor = this.#gestureController.getWheelZoomFactor(input);
    const next = anchoredTransform(anchor, viewport, this.#delegate.clampScale(start.scale * factor));
    this.#delegate.applyZoom(next);
  }

  #handleWheelPan(input: WheelGestureInput): void {
    if (!this.#host.pannable || !input.claim()) return;
    const start = this.#delegate.getTransform();
    const next = {
      scale: start.scale,
      x: start.x + input.deltaX / start.scale,
      y: start.y + input.deltaY / start.scale
    };
    this.#delegate.applyPan(next);
  }

  #handleGesture = (event: CustomEvent<Gesture<PinchContext>>): void => {
    const gesture = event.detail;
    if (gesture.kind === 'pinch') {
      this.#handlePinchGesture(gesture);
    } else if (gesture.kind === 'pan') {
      this.#handlePointerPan(gesture);
    }
  };

  #handlePointerPan(gesture: PointerMovementGesture & { readonly kind: 'pan' }): void {
    const session = this.#pointerPanSessions.get(gesture.event.pointerId);
    if (!session || session.state === 'suppressed') return;
    session.lastTotalDisplacementX = gesture.totalDisplacementX;
    session.lastTotalDisplacementY = gesture.totalDisplacementY;
    if (session.state === 'pending' && !this.#activatePointerPan(gesture, session)) return;
    const displacementX = gesture.totalDisplacementX - session.transformStartDisplacementX;
    const displacementY = gesture.totalDisplacementY - session.transformStartDisplacementY;
    this.#delegate.applyPan({
      scale: session.transformStart.scale,
      x: session.transformStart.x - displacementX / session.transformStart.scale,
      y: session.transformStart.y - displacementY / session.transformStart.scale
    });
  }

  #activatePointerPan(gesture: PointerMovementGesture, session: PointerPanSession): boolean {
    const distanceSquared = gesture.totalDisplacementX ** 2 + gesture.totalDisplacementY ** 2;
    if (distanceSquared < session.dragThreshold ** 2 || !this.#host.pannable) return false;
    session.state = 'active';
    session.exceededThreshold = true;
    this.#syncPanningState();
    return true;
  }

  #handlePinchGesture(gesture: Extract<Gesture<PinchContext>, { kind: 'pinch' }>): void {
    this.#interruptPointerPansForPinch();
    const viewport = this.#delegate.clientToViewport(gesture.centerClientX, gesture.centerClientY);
    const nextScale = this.#delegate.clampScale(gesture.context.start.scale * gesture.scale);
    const next = anchoredTransform(gesture.context.anchor, viewport, nextScale);
    this.#delegate.applyZoom(next);
  }

  #beginPinch = (pinch: PinchStart): { context: PinchContext } | undefined => {
    if (!this.#host.zoomable) return undefined;
    const start = this.#delegate.getTransform();
    const viewport = this.#delegate.clientToViewport(pinch.startCenterClientX, pinch.startCenterClientY);
    const context: PinchContext = {
      anchor: contentPointFromViewport(viewport.x, viewport.y, start),
      start
    };
    this.#pinchPointerIds = new Set([pinch.firstPointerId, pinch.secondPointerId]);
    return { context };
  };

  #interruptPointerPansForPinch(): void {
    for (const pointerId of this.#pinchPointerIds ?? []) {
      const session = this.#pointerPanSessions.get(pointerId);
      if (session) this.#suppressPointerPan(session);
    }
    this.#syncPanningState();
  }

  #suppressPointerPan(session: PointerPanSession): void {
    session.state = 'suppressed';
  }

  #handleSpaceKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== 'Space' || this.#host.behaviorPan !== 'space') return;
    if (!isImmediateRootActiveElement(this.#host)) return;
    event.preventDefault();
  };

  #handleFocus = (): void => {
    this.#syncPanEligibleState();
  };

  #handleBlur = (): void => {
    this.#host._internals.states.delete('pan-eligible');
  };

  #handlePointerOver = (event: PointerEvent): void => {
    if (!this.#host.pannable) return;
    this.#nativeInteractionHovered = eventTargetsNativeInteraction(event, this.#host);
    this.#syncPanEligibleState();
  };

  #acceptsPointerPan(event: PointerEvent): boolean {
    if (event.button === 0) {
      return this.#host.behaviorPan === true || (this.#host.behaviorPan === 'space' && this.#isSpacePanEligible());
    }
    if (event.button === 1) return this.#host.pannable;
    return false;
  }

  #isSpacePanEligible(): boolean {
    return this.#keyStateController.isPressed('Space') && isImmediateRootActiveElement(this.#host);
  }

  #shouldIgnoreEvent = (event: Event): boolean => {
    if (event.type === 'dragstart' && !this.#host.pannable) return true;
    return eventTargetsViewportOverlay(event, this.#host) || eventTargetsNativeInteraction(event, this.#host);
  };

  #shouldPreventContextMenu = (event: MouseEvent): boolean => {
    if (!event.ctrlKey) return false;
    return this.#host.behaviorPan === true || (this.#host.behaviorPan === 'space' && this.#isSpacePanEligible());
  };

  #shouldReservePointerDown = (event: PointerEvent): boolean =>
    this.#host.behaviorPan === 'space' &&
    this.#isSpacePanEligible() &&
    (event.pointerType === 'mouse' || event.pointerType === 'pen') &&
    event.button === 0;

  #getTouchAction = (): string | undefined =>
    this.#host.pannable || this.#host.zoomable || this.#pointerPanSessions.size > 0 ? 'none' : undefined;

  #rebasePointerPans(): void {
    const transformStart = this.#delegate.getTransform();
    for (const session of this.#pointerPanSessions.values()) {
      this.#rebaseEligiblePointerPan(session, transformStart);
    }
  }

  #rebaseEligiblePointerPan(session: PointerPanSession, transformStart: ViewportTransform): void {
    if (session.state === 'suppressed') return;
    session.transformStart = transformStart;
    session.transformStartDisplacementX = session.lastTotalDisplacementX;
    session.transformStartDisplacementY = session.lastTotalDisplacementY;
  }

  #handleClickCapture = (event: PointerEvent): void => {
    const suppression = this.#suppressedClicks.get(event.pointerId);
    if (!suppression || suppression.eventType !== event.type) return;
    this.#clearSuppressedClick(event.pointerId);
    this.#syncBehaviorPolicy();
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  #queueClickSuppression(pointerId: number, session: PointerPanSession): void {
    const eventType = session.pointerType === 'touch' || session.button === 0 ? 'click' : 'auxclick';
    this.#clearSuppressedClick(pointerId);
    const timer = globalThis.setTimeout(() => {
      this.#clearSuppressedClick(pointerId);
      this.#syncBehaviorPolicy();
    });
    this.#suppressedClicks.set(pointerId, { eventType, timer });
    this.#setClickListeners(true);
  }

  #clearSuppressedClick(pointerId: number): void {
    const suppression = this.#suppressedClicks.get(pointerId);
    if (!suppression) return;
    clearTimeout(suppression.timer);
    this.#suppressedClicks.delete(pointerId);
  }

  #clearPointerState(): void {
    this.#pointerPanSessions.clear();
    this.#pinchPointerIds = undefined;
    for (const pointerId of this.#suppressedClicks.keys()) this.#clearSuppressedClick(pointerId);
    this.#syncPanningState();
  }

  #syncPanningState(): void {
    const panning = [...this.#pointerPanSessions.values()].some(session => session.state === 'active');
    if (panning) this.#host._internals.states.add('panning');
    else this.#host._internals.states.delete('panning');
  }

  #syncPanEligibleState(): void {
    const eligible =
      !this.#nativeInteractionHovered &&
      (this.#host.behaviorPan === true || (this.#host.behaviorPan === 'space' && this.#isSpacePanEligible()));
    if (eligible) this.#host._internals.states.add('pan-eligible');
    else this.#host._internals.states.delete('pan-eligible');
  }

  #setSpaceKeyListener(enabled: boolean): void {
    const target = enabled ? (this.#host.ownerDocument.defaultView ?? undefined) : undefined;
    if (target === this.#spaceKeyListenerTarget) return;
    this.#spaceKeyListenerTarget?.removeEventListener('keydown', this.#handleSpaceKeyDown as EventListener);
    this.#spaceKeyListenerTarget = target;
    this.#spaceKeyListenerTarget?.addEventListener('keydown', this.#handleSpaceKeyDown as EventListener);
  }

  #setClickListeners(enabled: boolean): void {
    if (enabled === this.#clickListenersActive) return;
    this.#clickListenersActive = enabled;
    if (enabled) {
      this.#host.addEventListener('click', this.#handleClickCapture as EventListener, true);
      this.#host.addEventListener('auxclick', this.#handleClickCapture as EventListener, true);
    } else {
      this.#host.removeEventListener('click', this.#handleClickCapture as EventListener, true);
      this.#host.removeEventListener('auxclick', this.#handleClickCapture as EventListener, true);
    }
  }
}

function eventTargetsViewportOverlay(event: Event, boundary: Element): boolean {
  for (const target of event.composedPath()) {
    if (target === boundary) break;
    if (target instanceof Element && target.parentElement === boundary && target.slot === 'overlay') return true;
  }
  return false;
}

function eventTargetsNativeInteraction(event: Event, boundary: Element): boolean {
  for (const target of event.composedPath()) {
    if (target === boundary) break;
    if (!(target instanceof Element)) continue;
    if (isNativeInteractionElement(target)) return true;
  }
  return false;
}

function isNativeInteractionElement(element: Element): boolean {
  return (
    element.matches('button, input, textarea, select, a[href], [contenteditable], [tabindex]') ||
    isFormAssociatedCustomElement(element)
  );
}

function isFormAssociatedCustomElement(element: Element): boolean {
  if (!element.localName.includes('-')) return false;
  return (element.constructor as typeof HTMLElement & { formAssociated?: boolean }).formAssociated === true;
}
