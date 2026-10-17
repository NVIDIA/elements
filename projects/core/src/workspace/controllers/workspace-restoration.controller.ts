// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';
import { nonnegativeFiniteOr } from '@nvidia-elements/core/internal';
import type { WorkspaceLayout } from '../utils/workspace-layout.utils.js';
import {
  animateWorkspacePresentation,
  captureWorkspacePresentation,
  workspacePresentationReady,
  workspaceAnimationDuration,
  type WorkspacePresentation
} from '../utils/workspace-restoration.utils.js';

export interface WorkspaceAnimationOptions {
  readonly duration?: number;
}

interface Restoration {
  target?: string;
  before: WorkspacePresentation;
  duration: number;
  animations: Animation[];
}

interface RestorationOptions {
  apply(layout: WorkspaceLayout | undefined): void;
  value(): string;
}

export class WorkspaceRestorationController {
  readonly #host: HTMLElement & ReactiveControllerHost;
  readonly #options: RestorationOptions;
  #restoration?: Restoration;

  constructor(host: HTMLElement & ReactiveControllerHost, options: RestorationOptions) {
    this.#host = host;
    this.#options = options;
    host.addController(this);
  }

  get active() {
    return this.#restoration !== undefined;
  }

  hostConnected() {
    this.#host.addEventListener('pointerdown', this.#guardStart, true);
    this.#host.addEventListener('keydown', this.#guardStart, true);
  }

  hostDisconnected() {
    this.finish();
    this.#host.removeEventListener('pointerdown', this.#guardStart, true);
    this.#host.removeEventListener('keydown', this.#guardStart, true);
  }

  animateTo(layout: WorkspaceLayout | undefined, options: WorkspaceAnimationOptions) {
    const target = layout ? JSON.stringify(layout) : '';
    if (target === this.#restoration?.target) return;
    if (!this.active && target === this.#options.value()) {
      this.#options.apply(layout);
      return;
    }
    this.transition(() => this.#options.apply(layout), options, target);
  }

  transition(apply: () => void, options: WorkspaceAnimationOptions = {}, target?: string) {
    const before = captureWorkspacePresentation(this.#host);
    this.finish();
    const duration = nonnegativeFiniteOr(options.duration, workspaceAnimationDuration(this.#host));
    if (
      !this.#host.isConnected ||
      !before.panels.size ||
      duration === 0 ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      apply();
      return;
    }
    const restoration: Restoration = { target, before, duration, animations: [] };
    this.#restoration = restoration;
    apply();
    void this.#animate(restoration);
  }

  finish() {
    const restoration = this.#restoration;
    this.#restoration = undefined;
    restoration?.animations.forEach(animation => animation.cancel());
  }

  async #animate(restoration: Restoration) {
    await workspacePresentationReady(this.#host);
    if (this.#restoration !== restoration || !this.#host.isConnected) return;
    const after = captureWorkspacePresentation(this.#host);
    const easing = getComputedStyle(this.#host).getPropertyValue('--nve-ref-animation-easing-100').trim() || 'ease';
    restoration.animations = animateWorkspacePresentation({ ...restoration, after, easing });
    await Promise.allSettled(restoration.animations.map(animation => animation.finished));
    if (this.#restoration === restoration) this.finish();
  }

  #guardStart = (event: Event) => {
    if (!this.active) return;
    const owned = event
      .composedPath()
      .find(
        (node): node is HTMLElement =>
          node instanceof HTMLElement &&
          node.getRootNode() === this.#host.shadowRoot &&
          (node.hasAttribute('data-panel') ||
            node.hasAttribute('data-drag-group') ||
            node.hasAttribute('data-boundary'))
      );
    if (!owned) return;
    if (
      event instanceof KeyboardEvent &&
      (!owned.hasAttribute('data-boundary') ||
        !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key))
    )
      return;
    event.stopImmediatePropagation();
    if (owned.hasAttribute('data-boundary')) event.preventDefault();
  };
}
