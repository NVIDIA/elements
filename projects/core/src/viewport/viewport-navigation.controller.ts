// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  isImmediateRootActiveElement,
  KeyNavigationSpatialController,
  type SpatialKeyCommand
} from '@nvidia-elements/core/internal';
import type { ViewportTransform } from './viewport.types.js';
import type { ViewportZoomAction } from './viewport-navigation.types.js';

const KEYBOARD_PAN_STEP = 20;
const KEYBOARD_PAN_LARGE_STEP = 100;

interface PanDirection {
  readonly horizontal: -1 | 0 | 1;
  readonly vertical: -1 | 0 | 1;
}

interface DiscretePanRequest {
  readonly direction: PanDirection;
  readonly viewportPixelStep: number;
}

type ViewportNavigationHost = HTMLElement &
  ReactiveControllerHost & {
    readonly pannable: boolean;
    readonly zoomable: boolean;
  };

interface ViewportNavigationDelegate {
  readonly applyPan: (next: ViewportTransform) => void;
  readonly applyZoom: (next: ViewportTransform, options: { readonly animated?: boolean }) => void;
  readonly getCenteredZoomTarget: (scale: number) => ViewportTransform;
  readonly getTransform: () => ViewportTransform;
  readonly getZoomTarget: (action: ViewportZoomAction) => ViewportTransform | undefined;
}

export class ViewportNavigationController implements ReactiveController {
  readonly #host: ViewportNavigationHost;
  readonly #delegate: ViewportNavigationDelegate;
  #managesTabIndex = false;

  constructor(host: ViewportNavigationHost, delegate: ViewportNavigationDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    host.addController(this);
    new KeyNavigationSpatialController(host, { isEnabled: () => host.pannable || host.zoomable });
  }

  hostConnected(): void {
    this.#host.addEventListener('nve-key', this.#handleSpatialKey as EventListener);
    this.#host.addEventListener('command', this.#handleCommand as EventListener);
    this.#host.addEventListener('keydown', this.#handleViewportKeyDown as EventListener);
    this.#syncFocusability(this.#host.pannable || this.#host.zoomable);
  }

  hostDisconnected(): void {
    this.#host.removeEventListener('nve-key', this.#handleSpatialKey as EventListener);
    this.#host.removeEventListener('command', this.#handleCommand as EventListener);
    this.#host.removeEventListener('keydown', this.#handleViewportKeyDown as EventListener);
  }

  hostUpdated(): void {
    this.#syncFocusability(this.#host.pannable || this.#host.zoomable);
  }

  #handleCommand = (event: CommandEvent): void => {
    if (event.command === '--pan-to') return this.#panTo(event.source);
    if (event.command === '--zoom-to') return this.#zoomTo(event.source);
    const panDirection = this.#host.pannable ? commandPanDirection(event.command) : undefined;
    if (panDirection) {
      this.#requestDiscretePan({
        direction: panDirection,
        viewportPixelStep: KEYBOARD_PAN_STEP
      });
      return;
    }
    if (!this.#host.zoomable) return;
    const action = commandZoomAction(event.command);
    if (!action) return;
    const next = this.#delegate.getZoomTarget(action);
    if (next) this.#delegate.applyZoom(next, { animated: true });
  };

  #panTo(source: Element | null): void {
    if (!this.#host.pannable || !source || !('x' in source) || !('y' in source)) return;
    const { x, y } = source;
    if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) return;
    this.#delegate.applyPan({ ...this.#delegate.getTransform(), x, y });
  }

  #zoomTo(source: Element | null): void {
    if (!this.#host.zoomable || !source || !('scale' in source)) return;
    const { scale } = source;
    if (typeof scale !== 'number' || !Number.isFinite(scale) || scale <= 0) return;
    this.#delegate.applyZoom(this.#delegate.getCenteredZoomTarget(scale), {});
  }

  #handleSpatialKey = (event: CustomEvent<SpatialKeyCommand>): void => {
    const command = event.detail;
    if (command.kind === 'direction') {
      if (!this.#acceptsKeyboardPan(command.event)) return;
      command.event.preventDefault();
      this.#requestDiscretePan({
        direction: keyboardPanDirection(command.key),
        viewportPixelStep: command.shiftKey ? KEYBOARD_PAN_LARGE_STEP : KEYBOARD_PAN_STEP
      });
    } else if (this.#acceptsKeyboardZoom(command.event)) {
      command.event.preventDefault();
      const action = command.key === '-' ? 'out' : 'in';
      const next = this.#delegate.getZoomTarget(action);
      if (next) this.#delegate.applyZoom(next, { animated: true });
    }
  };

  #requestDiscretePan(request: DiscretePanRequest): void {
    const start = this.#delegate.getTransform();
    const contentStep = request.viewportPixelStep / start.scale;
    const next = {
      scale: start.scale,
      x: start.x + request.direction.horizontal * contentStep,
      y: start.y + request.direction.vertical * contentStep
    };
    this.#delegate.applyPan(next);
  }

  #handleViewportKeyDown = (event: KeyboardEvent): void => {
    if (!this.#acceptsKeyboardZoom(event) || (!event.ctrlKey && !event.metaKey)) return;
    const action = event.key === '0' ? 'reset' : event.key === '1' ? 'fit' : undefined;
    if (!action) return;
    const next = this.#delegate.getZoomTarget(action);
    if (!next) return;
    event.preventDefault();
    this.#delegate.applyZoom(next, { animated: true });
  };

  #acceptsKeyboardZoom(event: KeyboardEvent): boolean {
    return this.#host.zoomable && isImmediateRootActiveElement(this.#host) && event.composedPath()[0] === this.#host;
  }

  #acceptsKeyboardPan(event: KeyboardEvent): boolean {
    return (
      this.#host.pannable &&
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
