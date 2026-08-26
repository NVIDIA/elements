// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveControllerHost } from 'lit';

const GESTURE_EVENT_TYPES = [
  'auxclick',
  'click',
  'contextmenu',
  'lostpointercapture',
  'pointercancel',
  'pointerdown',
  'pointermove',
  'pointerup',
  'wheel'
] as const;

interface Point {
  readonly x: number;
  readonly y: number;
}

export interface GestureCapabilities {
  readonly drag: boolean;
  readonly pan: boolean;
  readonly pinch: boolean;
  readonly wheel: boolean;
}

interface PointerMovementGesture {
  readonly event: PointerEvent;
  readonly movementX: number;
  readonly movementY: number;
}

export type Gesture<TPinchContext> =
  | (PointerMovementGesture & { readonly kind: 'drag' })
  | (PointerMovementGesture & { readonly kind: 'pan' })
  | {
      readonly context: TPinchContext;
      readonly event: PointerEvent;
      readonly kind: 'pinch';
      readonly scale: number;
    }
  | {
      readonly deltaPixels: number;
      readonly event: WheelEvent;
      readonly kind: 'wheel';
    };

export type UnhandledPointerInput =
  | { readonly event: PointerEvent; readonly kind: 'click' }
  | { readonly event: PointerEvent; readonly kind: 'lostpointercapture' }
  | { readonly event: PointerEvent; readonly kind: 'pointercancel' }
  | { readonly event: PointerEvent; readonly kind: 'pointerdown' }
  | { readonly event: PointerEvent; readonly kind: 'pointermove' }
  | { readonly event: PointerEvent; readonly kind: 'pointerup' };

export interface GestureControllerOptions<TPinchContext = undefined> {
  /** Creates a snapshot of caller state when a pinch begins. Omit this field to disable pinch recognition. */
  readonly createPinchContext?: () => TPinchContext;
  /** Returns the gesture kinds that the controller can recognize for the current input event. */
  readonly getCapabilities: () => GestureCapabilities;
  /** Updates caller state before the controller reads capabilities for a nonignored input event. */
  readonly prepare?: () => void;
  /** Returns whether the controller should skip an input event before preparing or recognizing it. */
  readonly shouldIgnore?: (event: Event) => boolean;
}

interface PinchState<TPinchContext> {
  readonly context: TPinchContext;
  readonly distance: number;
  readonly pointerIds: readonly [number, number];
}

type GestureHost = EventTarget & ReactiveControllerHost;

/** Recognizes drag, pan, pinch, and wheel input on a dynamically assigned target. */
export class GestureController<TPinchContext = undefined> implements ReactiveController {
  readonly #host: GestureHost;
  readonly #options: GestureControllerOptions<TPinchContext>;
  readonly #panPointerIds = new Set<number>();
  readonly #pointerPositions = new Map<number, Point>();
  #connected = false;
  #pinch?: PinchState<TPinchContext>;
  #target?: HTMLElement;

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

  #addTargetListeners(): void {
    if (!this.#connected || !this.#target) return;
    for (const type of GESTURE_EVENT_TYPES) this.#target.addEventListener(type, this.#handleEvent, true);
  }

  #removeTargetListeners(): void {
    if (!this.#connected || !this.#target) return;
    for (const type of GESTURE_EVENT_TYPES) this.#target.removeEventListener(type, this.#handleEvent, true);
  }

  #handleEvent = (event: Event): void => {
    const target = this.#target;
    if (!target || event.currentTarget !== target || this.#options.shouldIgnore?.(event)) return;
    this.#options.prepare?.();
    const capabilities = this.#options.getCapabilities();
    if (event instanceof WheelEvent) {
      this.#handleWheel(event, capabilities);
    } else if (event.type === 'contextmenu') {
      if (capabilities.pan) event.preventDefault();
    } else if (event instanceof PointerEvent) {
      this.#handlePointer(event, capabilities);
    }
  };

  #handleWheel(event: WheelEvent, capabilities: GestureCapabilities): void {
    const target = this.#target;
    if (!capabilities.wheel || !target) return;
    this.#dispatchGesture({
      deltaPixels: normalizeWheelDelta(event, target),
      event,
      kind: 'wheel'
    });
    event.preventDefault();
  }

  #handlePointer(event: PointerEvent, capabilities: GestureCapabilities): void {
    switch (event.type) {
      case 'auxclick':
      case 'click':
        this.#handleClick(event, capabilities);
        break;
      case 'lostpointercapture':
        this.#pointerPositions.delete(event.pointerId);
        this.#panPointerIds.delete(event.pointerId);
        if (this.#pinch?.pointerIds.includes(event.pointerId)) this.#pinch = undefined;
        this.#dispatchPointerInput({ event, kind: 'lostpointercapture' });
        break;
      case 'pointercancel':
        this.#pointerPositions.delete(event.pointerId);
        this.#panPointerIds.delete(event.pointerId);
        this.#pinch = undefined;
        this.#dispatchPointerInput({ event, kind: 'pointercancel' });
        break;
      case 'pointerdown':
        this.#handlePointerDown(event, capabilities);
        break;
      case 'pointermove':
        this.#handlePointerMove(event, capabilities);
        break;
      case 'pointerup':
        this.#handlePointerUp(event);
        break;
    }
  }

  #handleClick(event: PointerEvent, capabilities: GestureCapabilities): void {
    if (event.button === 2 && capabilities.pan) {
      consumePanBoundaryEvent(event);
    } else if (event.type === 'click') {
      this.#dispatchPointerInput({ event, kind: 'click' });
    }
  }

  #handlePointerDown(event: PointerEvent, capabilities: GestureCapabilities): void {
    const canPinch = capabilities.pinch && this.#options.createPinchContext !== undefined;
    this.#pointerPositions.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (event.button === 2 && capabilities.pan) this.#panPointerIds.add(event.pointerId);
    if (hasPointerCapability(capabilities, canPinch)) this.#capturePointer(event.pointerId);
    if (this.#panPointerIds.has(event.pointerId)) {
      consumePanBoundaryEvent(event);
      return;
    }
    if (canPinch) this.#startPinchIfNeeded();
    this.#dispatchPointerInput({ event, kind: 'pointerdown' });
  }

  #handlePointerUp(event: PointerEvent): void {
    this.#pointerPositions.delete(event.pointerId);
    const wasPanPointer = this.#panPointerIds.delete(event.pointerId);
    if (this.#pinch?.pointerIds.includes(event.pointerId)) this.#pinch = undefined;
    if (wasPanPointer) {
      consumePanBoundaryEvent(event);
    } else {
      this.#dispatchPointerInput({ event, kind: 'pointerup' });
    }
  }

  #handlePointerMove(event: PointerEvent, capabilities: GestureCapabilities): void {
    if (event.buttons === 0) {
      this.#handlePointerButtonsReleased(event);
      return;
    }
    const canPinch = capabilities.pinch && this.#options.createPinchContext !== undefined;
    const movement = this.#updatePointerPosition(event);
    if (!movement || !hasPointerCapability(capabilities, canPinch)) {
      return this.#dispatchPointerInput({ event, kind: 'pointermove' });
    }
    if (this.#handlePanMove(event, movement, capabilities)) return;
    if (this.#pointerPositions.size >= 2 && canPinch && this.#handlePinch(event)) return;
    if (!capabilities.drag) return this.#dispatchPointerInput({ event, kind: 'pointermove' });
    this.#capturePointer(event.pointerId);
    event.preventDefault();
    this.#dispatchGesture({ event, kind: 'drag', movementX: movement.x, movementY: movement.y });
  }

  #handlePointerButtonsReleased(event: PointerEvent): void {
    this.#pointerPositions.delete(event.pointerId);
    this.#panPointerIds.delete(event.pointerId);
    this.#pinch = undefined;
    this.#dispatchPointerInput({ event, kind: 'pointermove' });
  }

  #handlePanMove(event: PointerEvent, movement: Point, capabilities: GestureCapabilities): boolean {
    if (!capabilities.pan || !this.#panPointerIds.has(event.pointerId)) return false;
    this.#capturePointer(event.pointerId);
    event.preventDefault();
    this.#dispatchGesture({ event, kind: 'pan', movementX: movement.x, movementY: movement.y });
    return true;
  }

  #updatePointerPosition(event: PointerEvent): Point | undefined {
    const previous = this.#pointerPositions.get(event.pointerId);
    if (!previous) return undefined;
    this.#pointerPositions.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const movement = { x: event.clientX - previous.x, y: event.clientY - previous.y };
    return movement.x === 0 && movement.y === 0 ? undefined : movement;
  }

  #handlePinch(event: PointerEvent): boolean {
    const createPinchContext = this.#options.createPinchContext;
    if (!createPinchContext) return false;
    if (this.#pinch && !this.#pinch.pointerIds.includes(event.pointerId)) return true;
    const pointerIds = this.#pinch?.pointerIds ?? this.#getPinchPointerIds();
    if (!pointerIds) return false;
    const distance = this.#getPointerDistance(pointerIds);
    if (distance === undefined || distance <= 0) return false;
    this.#pinch ??= { context: createPinchContext(), distance, pointerIds };
    this.#capturePointer(event.pointerId);
    event.preventDefault();
    this.#dispatchGesture({
      context: this.#pinch.context,
      event,
      kind: 'pinch',
      scale: distance / this.#pinch.distance
    });
    return true;
  }

  #startPinchIfNeeded(): void {
    const createPinchContext = this.#options.createPinchContext;
    if (this.#pointerPositions.size !== 2 || !createPinchContext) return;
    const pointerIds = this.#getPinchPointerIds();
    if (!pointerIds) return;
    const distance = this.#getPointerDistance(pointerIds);
    if (distance !== undefined && distance > 0) {
      this.#pinch = { context: createPinchContext(), distance, pointerIds };
    }
  }

  #getPinchPointerIds(): [number, number] | undefined {
    const pointerIds = [...this.#pointerPositions.keys()];
    const first = pointerIds[0];
    const second = pointerIds[1];
    return first === undefined || second === undefined ? undefined : [first, second];
  }

  #getPointerDistance(pointerIds: readonly [number, number]): number | undefined {
    const first = this.#pointerPositions.get(pointerIds[0]);
    const second = this.#pointerPositions.get(pointerIds[1]);
    return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : undefined;
  }

  #capturePointer(pointerId: number): void {
    try {
      this.#target?.setPointerCapture?.(pointerId);
    } catch {
      // Synthetic test events and browser implementations may not have an active pointer to capture.
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

  #dispatchPointerInput(input: UnhandledPointerInput): void {
    this.#host.dispatchEvent(
      new CustomEvent<UnhandledPointerInput>('nve-pointer-input', {
        bubbles: false,
        cancelable: false,
        composed: false,
        detail: input
      })
    );
  }

  #resetGestureState(): void {
    this.#pointerPositions.clear();
    this.#panPointerIds.clear();
    this.#pinch = undefined;
  }
}

function hasPointerCapability(capabilities: GestureCapabilities, canPinch: boolean): boolean {
  return capabilities.drag || capabilities.pan || canPinch;
}

function consumePanBoundaryEvent(event: Event): void {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function normalizeWheelDelta(event: WheelEvent, target: HTMLElement): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * target.getBoundingClientRect().height;
  return event.deltaY;
}
