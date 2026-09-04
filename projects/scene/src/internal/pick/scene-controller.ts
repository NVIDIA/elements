// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { UnhandledPointerInput } from '@nvidia-elements/core/internal';
import { PickCoordinator, type PickCompletion } from './coordinator.js';
import { registerSceneMarkerInteractionController } from '../markers/interaction.js';
import {
  copyPickHit,
  requestScenePick,
  type PickScope,
  type ScenePickDriver,
  type ScenePickHit,
  type ScenePickResult
} from './routing.js';
import { isInteractiveLayer } from '../interaction.js';
import { isCurrentMarkerLayerMarker } from '../markers/layer-state.js';

export class ScenePicking {
  #coordinator: PickCoordinator<ScenePickHit>;
  #epoch = 0;
  readonly #getCanvas: () => HTMLCanvasElement | undefined;
  readonly #driver: ScenePickDriver;
  readonly #hasInteractiveTargets: () => boolean;
  readonly #getReady: () => Promise<void>;
  readonly #host: HTMLElement;
  #hoverHit: ScenePickHit | null = null;
  #invalidation = new DOMException('The scene is unavailable for picking.', 'AbortError');
  #markerInteractionCleanup?: () => void;
  #interactionGeneration = 0;
  #pendingEvents = new Map<number, PointerEvent>();
  #syntheticEvents = new WeakSet<Event>();

  constructor(options: {
    readonly driver: ScenePickDriver;
    readonly getCanvas: () => HTMLCanvasElement | undefined;
    readonly getReady: () => Promise<void>;
    readonly hasInteractiveTargets: () => boolean;
    readonly host: HTMLElement;
  }) {
    this.#driver = options.driver;
    this.#getCanvas = options.getCanvas;
    this.#getReady = options.getReady;
    this.#hasInteractiveTargets = options.hasInteractiveTargets;
    this.#host = options.host;
    this.#coordinator = this.#createCoordinator();
  }

  connect(): void {
    this.#coordinator = this.#createCoordinator();
    this.#markerInteractionCleanup = registerSceneMarkerInteractionController(this.#host, {
      activateMarker: (marker, event) => this.#activateMarker(marker, event)
    });
  }

  disconnect(reason: DOMException): void {
    this.invalidate(reason);
    this.#markerInteractionCleanup?.();
    this.#markerInteractionCleanup = undefined;
  }

  isSyntheticEvent(event: Event): boolean {
    return this.#syntheticEvents.has(event);
  }

  pick(clientX: number, clientY: number): Promise<ScenePickHit | null> {
    assertFiniteCoordinate(clientX, 'clientX');
    assertFiniteCoordinate(clientY, 'clientY');
    if (!this.#host.isConnected) {
      return Promise.reject(new DOMException('The scene is not connected.', 'InvalidStateError'));
    }
    return this.#createResolver(clientX, clientY, 'all')();
  }

  handleUnhandledPointer(input: UnhandledPointerInput): void {
    if (input.kind === 'lostpointercapture' || input.kind === 'pointercancel') {
      this.handlePointerExit(input.event);
      return;
    }
    if (!this.#hasInteractiveTargets()) {
      this.#resetAutomaticInteraction();
      return;
    }
    if (input.kind === 'pointermove') {
      this.#requestHover(input.event);
      return;
    }
    const { event, kind } = input;
    event.stopImmediatePropagation();
    this.#queuePointer(kind, event, this.#createResolver(event.clientX, event.clientY, 'interactive'));
  }

  routeBlockedPointer(event: PointerEvent): void {
    if (!this.#hasInteractiveTargets()) {
      this.#resetAutomaticInteraction();
      return;
    }
    const resolver = this.#createResolver(event.clientX, event.clientY, 'interactive');
    this.#queuePointer(event.type as 'pointerdown' | 'pointerup' | 'click', event, resolver);
  }

  /** Cancels stale hover readback and leaves the current hit when the pointer exits the canvas. */
  handlePointerExit(event: PointerEvent): void {
    if (isInsideScene(this.#host, event.relatedTarget)) return;
    this.#coordinator.cancelHover();
    const previous = this.#hoverHit;
    this.#hoverHit = null;
    if (previous) this.#dispatchHoverEvent('leave', event, previous);
  }

  reconcileInteractionAvailability(): void {
    if (!this.#hasInteractiveTargets()) this.#resetAutomaticInteraction();
  }

  invalidate(reason: DOMException): void {
    this.#epoch += 1;
    this.#interactionGeneration += 1;
    this.#invalidation = reason;
    this.#pendingEvents.clear();
    this.#hoverHit = null;
    this.#coordinator = this.#createCoordinator();
  }

  #queuePointer(
    kind: 'pointerdown' | 'pointerup' | 'click',
    event: PointerEvent,
    resolver: () => Promise<ScenePickHit | null>
  ): void {
    const handle = this.#coordinator.request(kind, resolver);
    this.#pendingEvents.set(handle.request.sequence, event);
    void handle.result.catch(() => this.#pendingEvents.delete(handle.request.sequence));
  }

  #requestHover(event: PointerEvent): void {
    const handle = this.#coordinator.request(
      'hover',
      this.#createResolver(event.clientX, event.clientY, 'interactive')
    );
    this.#pendingEvents.set(handle.request.sequence, event);
    void handle.result.catch(() => this.#pendingEvents.delete(handle.request.sequence));
  }

  #createResolver(clientX: number, clientY: number, scope: PickScope): () => Promise<ScenePickHit | null> {
    const epoch = this.#epoch;
    const ready = this.#getReady();
    return () =>
      ready.then(() => {
        this.#assertEpoch(epoch);
        const canvas = this.#getCanvas();
        if (!canvas) throw new DOMException('The scene canvas is unavailable.', 'InvalidStateError');
        return this.#resolve({ canvas, clientX, clientY, epoch, scope });
      });
  }

  #resolve(options: {
    readonly canvas: HTMLCanvasElement;
    readonly clientX: number;
    readonly clientY: number;
    readonly epoch: number;
    readonly scope: PickScope;
  }): Promise<ScenePickHit | null> {
    const { canvas, clientX, clientY, epoch, scope } = options;
    return requestScenePick({
      canvas,
      clientX,
      clientY,
      driver: this.#driver,
      scope
    }).then(
      result => {
        this.#assertEpoch(epoch);
        if (result && scope === 'interactive' && !this.#isCurrentInteractiveResult(result)) return null;
        return result ? copyPickHit(result) : null;
      },
      error => {
        if (epoch !== this.#epoch) throw this.#invalidation;
        throw error;
      }
    );
  }

  #assertEpoch(epoch: number): void {
    if (epoch !== this.#epoch) throw this.#invalidation;
    if (!this.#host.isConnected) throw new DOMException('The scene is not connected.', 'InvalidStateError');
  }

  #isCurrentInteractiveResult(result: ScenePickResult): boolean {
    const { layer, marker } = result;
    return (
      isInteractiveLayer(layer) &&
      layer.closest('nve-scene') === this.#host &&
      layer.closest('[hidden]') === null &&
      (marker === undefined || isCurrentMarkerLayerMarker(layer, marker))
    );
  }

  #createCoordinator(): PickCoordinator<ScenePickHit> {
    const epoch = this.#epoch;
    const interactionGeneration = this.#interactionGeneration;
    return new PickCoordinator<ScenePickHit>({
      onComplete: completion => {
        if (epoch === this.#epoch && interactionGeneration === this.#interactionGeneration)
          this.#handleCompletion(completion);
      },
      onStaleHover: request => {
        if (epoch === this.#epoch && interactionGeneration === this.#interactionGeneration)
          this.#pendingEvents.delete(request.sequence);
      }
    });
  }

  #resetAutomaticInteraction(): void {
    if (this.#pendingEvents.size === 0 && this.#hoverHit === null) return;
    this.#interactionGeneration += 1;
    this.#pendingEvents.clear();
    this.#hoverHit = null;
    this.#coordinator = this.#createCoordinator();
  }

  #handleCompletion(completion: PickCompletion<ScenePickHit>): void {
    const event = this.#pendingEvents.get(completion.request.sequence);
    this.#pendingEvents.delete(completion.request.sequence);
    if (!event || !this.#host.isConnected) return;
    if (completion.request.kind === 'hover') this.#updateHover(event, completion.hit);
    else this.#dispatchResolvedPointer(event, completion.hit);
  }

  #updateHover(event: PointerEvent, next: ScenePickHit | null): void {
    const previous = this.#hoverHit;
    if (isSameHoverTarget(previous, next)) {
      this.#hoverHit = next;
      return;
    }
    if (previous) this.#dispatchHoverEvent('leave', event, previous);
    this.#hoverHit = next;
    if (next) this.#dispatchHoverEvent('enter', event, next);
  }

  #dispatchResolvedPointer(event: PointerEvent, hit: ScenePickHit | null): void {
    const target = hit?.element ?? this.#host;
    const synthetic = createSyntheticPointerEvent(event.type, event, { bubbles: true, cancelable: true });
    this.#syntheticEvents.add(synthetic);
    target.dispatchEvent(synthetic);
    if (event.type === 'click' && hit) {
      hit.element.dispatchEvent(createSceneInteractionEvent('nve-scene-click', hit));
    }
  }

  #dispatchHoverEvent(kind: 'enter' | 'leave', event: PointerEvent, hit: ScenePickHit): void {
    if (hit.element !== hit.layer) {
      hit.element.dispatchEvent(
        createSyntheticPointerEvent(`pointer${kind}`, event, { bubbles: false, cancelable: false })
      );
    }
    hit.element.dispatchEvent(createSceneInteractionEvent(`nve-scene-pointer${kind}`, hit));
  }

  #activateMarker(marker: HTMLElement, event: KeyboardEvent): void {
    if (!this.#host.isConnected || marker.closest('nve-scene') !== this.#host) return;
    marker.dispatchEvent(createSyntheticPointerEvent('click', event, { bubbles: true, cancelable: true }));
  }
}

function isInsideScene(host: HTMLElement, target: EventTarget | null): boolean {
  return (
    target instanceof Node && (target === host || host.contains(target) || host.shadowRoot?.contains(target) === true)
  );
}

function assertFiniteCoordinate(value: number, name: string): void {
  if (typeof value !== 'number') throw new TypeError(`${name} must be a number.`);
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite.`);
}

function isSameHoverTarget(previous: ScenePickHit | null, next: ScenePickHit | null): boolean {
  if (!previous || !next) return false;
  return previous.featureId !== undefined || next.featureId !== undefined
    ? isSameFeature(previous, next)
    : isSameDetailedTarget(previous, next);
}

function isSameFeature(previous: ScenePickHit, next: ScenePickHit): boolean {
  return previous.layer === next.layer && previous.featureId === next.featureId;
}

function isSameDetailedTarget(previous: ScenePickHit, next: ScenePickHit): boolean {
  return (
    previous.element === next.element && previous.layer === next.layer && isSamePickTarget(previous.target, next.target)
  );
}

function isSamePickTarget(previous: ScenePickHit['target'], next: ScenePickHit['target']): boolean {
  return pickTargetIdentity(previous) === pickTargetIdentity(next);
}

function pickTargetIdentity(target: ScenePickHit['target']): string {
  return target.kind === 'surface' ? 'surface' : `${target.kind}:${target.index}`;
}

function createSyntheticPointerEvent(
  type: string,
  source: PointerEvent | KeyboardEvent,
  options: { bubbles: boolean; cancelable: boolean }
): PointerEvent {
  return new PointerEvent(type, {
    bubbles: options.bubbles,
    cancelable: options.cancelable,
    composed: true,
    altKey: source.altKey,
    button: source instanceof PointerEvent ? source.button : 0,
    buttons: source instanceof PointerEvent ? source.buttons : 0,
    clientX: source instanceof PointerEvent ? source.clientX : 0,
    clientY: source instanceof PointerEvent ? source.clientY : 0,
    ctrlKey: source.ctrlKey,
    metaKey: source.metaKey,
    pointerId: source instanceof PointerEvent ? source.pointerId : 0,
    pointerType: source instanceof PointerEvent ? source.pointerType : '',
    pressure: source instanceof PointerEvent ? source.pressure : 0,
    screenX: source instanceof PointerEvent ? source.screenX : 0,
    screenY: source instanceof PointerEvent ? source.screenY : 0,
    shiftKey: source.shiftKey
  });
}

function createSceneInteractionEvent(
  type: 'nve-scene-click' | 'nve-scene-pointerenter' | 'nve-scene-pointerleave',
  hit: ScenePickHit
): CustomEvent<ScenePickHit> {
  return new CustomEvent<ScenePickHit>(type, {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail: hit
  });
}
