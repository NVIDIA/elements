// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { UnhandledPointerInput } from '@nvidia-elements/core/internal';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { PickCoordinator, type PickCompletion } from './coordinator.js';
import {
  copyPickHit,
  requestScenePick,
  type PickScope,
  type ScenePickDriver,
  type ScenePickHit,
  type ScenePickResult
} from './routing.js';
import { isInteractiveLayer } from '../interaction.js';

type PickHost = HTMLElement & ReactiveControllerHost & { readonly ready: Promise<void> };

export class PickController implements ReactiveController {
  #canvas?: HTMLCanvasElement;
  #coordinator: PickCoordinator<ScenePickHit>;
  #epoch = 0;
  readonly #driver: ScenePickDriver;
  readonly #hasInteractiveTargets: () => boolean;
  readonly #host: PickHost;
  #hoverHit: ScenePickHit | null = null;
  #invalidation = new DOMException('The scene is unavailable for picking.', 'AbortError');
  #interactionGeneration = 0;
  #pendingEvents = new Map<number, PointerEvent>();

  constructor(options: {
    readonly driver: ScenePickDriver;
    readonly hasInteractiveTargets: () => boolean;
    readonly host: PickHost;
  }) {
    this.#driver = options.driver;
    this.#hasInteractiveTargets = options.hasInteractiveTargets;
    this.#host = options.host;
    this.#coordinator = this.#createCoordinator();
    options.host.addController(this);
  }

  hostConnected(): void {
    this.#host.addEventListener('nve-pointer-input', this.#handlePointerInput as EventListener);
  }

  hostDisconnected(): void {
    this.#host.removeEventListener('nve-pointer-input', this.#handlePointerInput as EventListener);
    this.#unbindCanvas();
    this.invalidate(new DOMException('The scene disconnected while picking.', 'AbortError'));
  }

  pick(clientX: number, clientY: number): Promise<ScenePickHit | null> {
    assertFiniteCoordinate(clientX, 'clientX');
    assertFiniteCoordinate(clientY, 'clientY');
    if (!this.#host.isConnected) {
      return Promise.reject(new DOMException('The scene is not connected.', 'InvalidStateError'));
    }
    return this.#createResolver(clientX, clientY, 'all')();
  }

  bindCanvas(canvas: HTMLCanvasElement): void {
    if (canvas === this.#canvas) return;
    this.#unbindCanvas();
    this.#canvas = canvas;
    canvas.addEventListener('pointerleave', this.#handlePointerExit);
    canvas.addEventListener('pointercancel', this.#handlePointerExit);
  }

  handleUnhandledPointer(input: UnhandledPointerInput): void {
    if (input.kind === 'lostpointercapture' || input.kind === 'pointercancel') {
      this.#handlePointerExit(input.event);
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

  /** Cancels stale hover readback and leaves the current hit when the pointer exits the canvas. */
  #handlePointerExit = (event: PointerEvent): void => {
    if (isInsideScene(this.#host, event.relatedTarget)) return;
    this.#coordinator.cancelHover();
    const previous = this.#hoverHit;
    this.#hoverHit = null;
    if (previous) this.#dispatchHoverEvent('leave', event, previous);
  };

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

  #handlePointerInput = (event: CustomEvent<UnhandledPointerInput>): void => {
    this.handleUnhandledPointer(event.detail);
  };

  #unbindCanvas(): void {
    this.#canvas?.removeEventListener('pointerleave', this.#handlePointerExit);
    this.#canvas?.removeEventListener('pointercancel', this.#handlePointerExit);
    this.#canvas = undefined;
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
    const ready = this.#host.ready;
    return () =>
      ready.then(() => {
        this.#assertEpoch(epoch);
        const canvas = this.#canvas;
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
    const { layer } = result;
    return isInteractiveLayer(layer) && layer.closest('nve-scene') === this.#host && layer.closest('[hidden]') === null;
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
