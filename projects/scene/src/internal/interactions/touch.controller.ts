// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveControllerHost } from 'lit';

const TOUCH_EVENT_TYPES = [
  'click',
  'contextmenu',
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

export interface TouchCapabilities {
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

export type TouchGesture<TPinchContext> =
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
  | { readonly event: PointerEvent; readonly kind: 'pointerdown' }
  | { readonly event: PointerEvent; readonly kind: 'pointermove' }
  | { readonly event: PointerEvent; readonly kind: 'pointerup' };

interface TouchControllerOptions<TPinchContext> {
  readonly createPinchContext: () => TPinchContext;
  readonly getCapabilities: () => TouchCapabilities;
  readonly onGesture: (gesture: TouchGesture<TPinchContext>) => void;
  readonly onUnhandledPointer: (input: UnhandledPointerInput) => void;
  readonly prepare?: () => void;
  readonly shouldIgnore?: (event: Event) => boolean;
}

interface PinchState<TPinchContext> {
  readonly context: TPinchContext;
  readonly distance: number;
}

/** Recognizes drag, pan, pinch, and wheel input on a dynamically assigned target. */
export class TouchController<TPinchContext> implements ReactiveController {
  readonly #options: TouchControllerOptions<TPinchContext>;
  readonly #panPointerIds = new Set<number>();
  readonly #pointerPositions = new Map<number, Point>();
  #connected = false;
  #pinch?: PinchState<TPinchContext>;
  #target?: HTMLElement;

  constructor(host: ReactiveControllerHost, options: TouchControllerOptions<TPinchContext>) {
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
    for (const type of TOUCH_EVENT_TYPES) this.#target.addEventListener(type, this.#handleEvent, true);
  }

  #removeTargetListeners(): void {
    if (!this.#connected || !this.#target) return;
    for (const type of TOUCH_EVENT_TYPES) this.#target.removeEventListener(type, this.#handleEvent, true);
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

  #handleWheel(event: WheelEvent, capabilities: TouchCapabilities): void {
    if (!capabilities.wheel || !this.#target) return;
    this.#options.onGesture({
      deltaPixels: normalizeWheelDelta(event, this.#target.getBoundingClientRect().height),
      event,
      kind: 'wheel'
    });
    event.preventDefault();
  }

  #handlePointer(event: PointerEvent, capabilities: TouchCapabilities): void {
    switch (event.type) {
      case 'click':
        this.#handleClick(event, capabilities);
        break;
      case 'pointercancel':
        this.#pointerPositions.delete(event.pointerId);
        this.#panPointerIds.delete(event.pointerId);
        this.#pinch = undefined;
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

  #handleClick(event: PointerEvent, capabilities: TouchCapabilities): void {
    if (event.button === 2 && capabilities.pan) {
      consumePanBoundaryEvent(event);
    } else {
      this.#options.onUnhandledPointer({ event, kind: 'click' });
    }
  }

  #handlePointerDown(event: PointerEvent, capabilities: TouchCapabilities): void {
    this.#pointerPositions.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (event.button === 2 && capabilities.pan) this.#panPointerIds.add(event.pointerId);
    if (hasPointerCapability(capabilities)) this.#capturePointer(event.pointerId);
    if (this.#panPointerIds.has(event.pointerId)) {
      consumePanBoundaryEvent(event);
      return;
    }
    if (capabilities.pinch) this.#startPinchIfNeeded();
    this.#options.onUnhandledPointer({ event, kind: 'pointerdown' });
  }

  #handlePointerUp(event: PointerEvent): void {
    this.#pointerPositions.delete(event.pointerId);
    const wasPanPointer = this.#panPointerIds.delete(event.pointerId);
    this.#pinch = undefined;
    if (wasPanPointer) {
      consumePanBoundaryEvent(event);
    } else {
      this.#options.onUnhandledPointer({ event, kind: 'pointerup' });
    }
  }

  #handlePointerMove(event: PointerEvent, capabilities: TouchCapabilities): void {
    const movement = this.#updatePointerPosition(event);
    if (!movement || !hasPointerCapability(capabilities)) {
      this.#options.onUnhandledPointer({ event, kind: 'pointermove' });
      return;
    }
    if (capabilities.pan && this.#handlePanMove(event, movement)) return;
    if (this.#pointerPositions.size >= 2 && capabilities.pinch && this.#handlePinch(event)) return;
    if (capabilities.drag) {
      this.#capturePointer(event.pointerId);
      event.preventDefault();
      this.#options.onGesture({ event, kind: 'drag', movementX: movement.x, movementY: movement.y });
      return;
    }
    this.#options.onUnhandledPointer({ event, kind: 'pointermove' });
  }

  #handlePanMove(event: PointerEvent, movement: Point): boolean {
    if (!this.#panPointerIds.has(event.pointerId)) return false;
    this.#capturePointer(event.pointerId);
    event.preventDefault();
    this.#options.onGesture({ event, kind: 'pan', movementX: movement.x, movementY: movement.y });
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
    const distance = this.#getPointerDistance();
    if (distance === undefined) return false;
    this.#pinch ??= { context: this.#options.createPinchContext(), distance };
    if (distance <= 0) return false;
    this.#capturePointer(event.pointerId);
    event.preventDefault();
    this.#options.onGesture({
      context: this.#pinch.context,
      event,
      kind: 'pinch',
      scale: distance / this.#pinch.distance
    });
    return true;
  }

  #startPinchIfNeeded(): void {
    if (this.#pointerPositions.size !== 2) return;
    const distance = this.#getPointerDistance();
    if (distance !== undefined) this.#pinch = { context: this.#options.createPinchContext(), distance };
  }

  #getPointerDistance(): number | undefined {
    const pointers = [...this.#pointerPositions.values()];
    const first = pointers[0];
    const second = pointers[1];
    return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : undefined;
  }

  #capturePointer(pointerId: number): void {
    try {
      this.#target?.setPointerCapture?.(pointerId);
    } catch {
      // Synthetic test events and browser implementations may not have an active pointer to capture.
    }
  }

  #resetGestureState(): void {
    this.#pointerPositions.clear();
    this.#panPointerIds.clear();
    this.#pinch = undefined;
  }
}

function hasPointerCapability(capabilities: TouchCapabilities): boolean {
  return capabilities.drag || capabilities.pan || capabilities.pinch;
}

function consumePanBoundaryEvent(event: Event): void {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function normalizeWheelDelta(event: WheelEvent, pageHeight: number): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * pageHeight;
  return event.deltaY;
}
