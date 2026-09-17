// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  isImmediateRootActiveElement,
  KeyNavigationSpatialController,
  type SpatialKeyCommand
} from '@nvidia-elements/core/internal';
import type {
  ViewportAnimationOptions,
  ViewportDiscretePanDetail,
  ViewportPanBehavior,
  ViewportPoint,
  ViewportTransform,
  ViewportZoomDetail
} from './viewport.types.js';
import type { ViewportNavigationEventDelegate, ViewportZoomAction } from './viewport-navigation.types.js';
import { contentPointFromViewport } from './viewport-projection.utils.js';

const KEYBOARD_PAN_STEP = 20;
const KEYBOARD_PAN_LARGE_STEP = 100;

interface PanDirection {
  readonly horizontal: -1 | 0 | 1;
  readonly vertical: -1 | 0 | 1;
}

interface DiscretePanRequest {
  readonly direction: PanDirection;
  readonly source: 'command' | 'keyboard';
  readonly viewportPixelStep: number;
}

type ViewportNavigationHost = HTMLElement &
  ReactiveControllerHost & {
    readonly behaviorPan: ViewportPanBehavior;
    readonly behaviorZoom: boolean;
  };

export interface ViewportNavigationDelegate {
  readonly animateTo: (target: Partial<ViewportTransform>, options?: ViewportAnimationOptions) => void;
  readonly commitTransform: (next: ViewportTransform) => boolean;
  readonly cancelAnimation: () => void;
  readonly consumeAutoFit: () => void;
  readonly events: ViewportNavigationEventDelegate;
  readonly getTransform: () => ViewportTransform;
  readonly getZoomTarget: (action: ViewportZoomAction) => ViewportTransform | undefined;
  readonly rebasePointerSessions: () => void;
  readonly viewportToClient: (viewportX: number, viewportY: number) => ViewportPoint;
}

/** Coordinates the viewport's opt-in keyboard and Invoker navigation behavior. */
export class ViewportNavigationController implements ReactiveController {
  readonly #host: ViewportNavigationHost;
  readonly #delegate: ViewportNavigationDelegate;
  #managesTabIndex = false;

  constructor(host: ViewportNavigationHost, delegate: ViewportNavigationDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    host.addController(this);
    new KeyNavigationSpatialController(host, { isEnabled: () => Boolean(host.behaviorPan) || host.behaviorZoom });
  }

  hostConnected(): void {
    this.#host.addEventListener('nve-key', this.#handleSpatialKey as EventListener);
    this.#host.addEventListener('command', this.#handleCommand as EventListener);
    this.#host.addEventListener('keydown', this.#handleViewportKeyDown as EventListener);
    this.#syncFocusability(Boolean(this.#host.behaviorPan) || this.#host.behaviorZoom);
  }

  hostDisconnected(): void {
    this.#host.removeEventListener('nve-key', this.#handleSpatialKey as EventListener);
    this.#host.removeEventListener('command', this.#handleCommand as EventListener);
    this.#host.removeEventListener('keydown', this.#handleViewportKeyDown as EventListener);
  }

  hostUpdated(): void {
    this.#syncFocusability(Boolean(this.#host.behaviorPan) || this.#host.behaviorZoom);
  }

  #handleCommand = (event: CommandEvent): void => {
    const panDirection = this.#host.behaviorPan ? commandPanDirection(event.command) : undefined;
    if (panDirection) {
      this.#requestDiscretePan(event, {
        direction: panDirection,
        source: 'command',
        viewportPixelStep: KEYBOARD_PAN_STEP
      });
      return;
    }
    if (!this.#host.behaviorZoom) return;
    const action = commandZoomAction(event.command);
    if (!action) return;
    const next = this.#delegate.getZoomTarget(action);
    if (next) this.#requestZoom(event, next, 'command');
  };

  #handleSpatialKey = (event: CustomEvent<SpatialKeyCommand>): void => {
    const command = event.detail;
    if (command.kind === 'direction') {
      if (!this.#acceptsKeyboardPan(command.event)) return;
      command.event.preventDefault();
      this.#requestDiscretePan(command.event, {
        direction: keyboardPanDirection(command.key),
        source: 'keyboard',
        viewportPixelStep: command.shiftKey ? KEYBOARD_PAN_LARGE_STEP : KEYBOARD_PAN_STEP
      });
    } else if (this.#acceptsKeyboardZoom(command.event)) {
      command.event.preventDefault();
      const action = command.key === '-' ? 'out' : 'in';
      const next = this.#delegate.getZoomTarget(action);
      if (next) this.#requestZoom(command.event, next, 'keyboard');
    }
  };

  #requestDiscretePan(event: CommandEvent | KeyboardEvent, request: DiscretePanRequest): void {
    this.#delegate.consumeAutoFit();
    this.#delegate.cancelAnimation();
    const start = this.#delegate.getTransform();
    const contentStep = request.viewportPixelStep / start.scale;
    const next = {
      scale: start.scale,
      x: start.x + request.direction.horizontal * contentStep,
      y: start.y + request.direction.vertical * contentStep
    };
    const detail: ViewportDiscretePanDetail = { event, next, source: request.source, start };
    if (this.#delegate.events.dispatchPan(detail) && this.#delegate.commitTransform(next)) {
      this.#delegate.rebasePointerSessions();
    }
  }

  #handleViewportKeyDown = (event: KeyboardEvent): void => {
    if (!this.#acceptsKeyboardZoom(event) || (!event.ctrlKey && !event.metaKey)) return;
    const action = event.key === '0' ? 'reset' : event.key === '1' ? 'fit' : undefined;
    if (!action) return;
    const next = this.#delegate.getZoomTarget(action);
    if (!next) return;
    event.preventDefault();
    this.#requestZoom(event, next, 'keyboard');
  };

  #requestZoom(event: CommandEvent | KeyboardEvent, next: ViewportTransform, source: 'command' | 'keyboard'): void {
    this.#delegate.consumeAutoFit();
    const start = this.#delegate.getTransform();
    const viewport = { x: this.#host.clientWidth / 2, y: this.#host.clientHeight / 2 };
    const client = this.#delegate.viewportToClient(viewport.x, viewport.y);
    const detail: ViewportZoomDetail = {
      anchor: contentPointFromViewport(viewport.x, viewport.y, start),
      clientX: client.x,
      clientY: client.y,
      event,
      factor: next.scale / start.scale,
      next,
      source,
      start
    };
    if (this.#delegate.events.dispatchZoom(detail)) this.#delegate.animateTo(next);
  }

  #acceptsKeyboardZoom(event: KeyboardEvent): boolean {
    return (
      this.#host.behaviorZoom && isImmediateRootActiveElement(this.#host) && event.composedPath()[0] === this.#host
    );
  }

  #acceptsKeyboardPan(event: KeyboardEvent): boolean {
    return (
      Boolean(this.#host.behaviorPan) &&
      isImmediateRootActiveElement(this.#host) &&
      event.composedPath()[0] === this.#host &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    );
  }

  #syncFocusability(behaviorEnabled: boolean): void {
    if (!behaviorEnabled) {
      if (this.#managesTabIndex && this.#host.getAttribute('tabindex') === '0') this.#host.removeAttribute('tabindex');
      this.#managesTabIndex = false;
    } else if (!this.#host.hasAttribute('tabindex')) {
      this.#host.tabIndex = 0;
      this.#managesTabIndex = true;
    }
  }
}

function commandPanDirection(command: string): PanDirection | undefined {
  if (command === '--pan-left') return { horizontal: -1, vertical: 0 };
  if (command === '--pan-right') return { horizontal: 1, vertical: 0 };
  if (command === '--pan-up') return { horizontal: 0, vertical: -1 };
  if (command === '--pan-down') return { horizontal: 0, vertical: 1 };
  return undefined;
}

function commandZoomAction(command: string): ViewportZoomAction | undefined {
  if (command === '--zoom-in') return 'in';
  if (command === '--zoom-out') return 'out';
  if (command === '--zoom-reset') return 'reset';
  if (command === '--zoom-to-fit') return 'fit';
  return undefined;
}

function keyboardPanDirection(key: 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp'): PanDirection {
  if (key === 'ArrowLeft') return { horizontal: -1, vertical: 0 };
  if (key === 'ArrowRight') return { horizontal: 1, vertical: 0 };
  if (key === 'ArrowUp') return { horizontal: 0, vertical: -1 };
  return { horizontal: 0, vertical: 1 };
}
