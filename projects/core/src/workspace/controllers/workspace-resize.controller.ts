// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';
import type { GestureInput } from '@nvidia-elements/core/internal';
import { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import type { WorkspaceChrome } from './workspace-chrome.controller.js';
import { resizeSizes, type WorkspaceLayout } from '../utils/workspace-layout.utils.js';
import type { WorkspaceBoundary } from '../utils/workspace-placement.utils.js';
import { rebaseProjectedSplit } from '../utils/workspace-resize.utils.js';

interface ResizePresentation {
  chrome: WorkspaceChrome;
  rearrangeable: boolean;
  closable: boolean;
}

interface ResizeOptions {
  enabled(): boolean;
  layout(): WorkspaceLayout | undefined;
  boundaries(): WorkspaceBoundary[];
  available(): string[];
  policy(): 'stop' | 'propagate';
  presentation(): ResizePresentation;
  cancelForUser(): void;
  commit(layout: WorkspaceLayout): void;
}

interface ResizeOperation {
  handle: ResizeHandle;
  pointerId?: number;
  status: 'active' | 'committed';
  baseline: WorkspaceLayout;
  origin: WorkspaceBoundary;
  policy: 'stop' | 'propagate';
  available: string[];
  presentation: ResizePresentation;
  preview?: WorkspaceLayout;
}

type ResizeTransaction = ResizeOperation | { handle: ResizeHandle; pointerId?: number; status: 'cancelled' };

export class WorkspaceResizeController {
  readonly #host: HTMLElement & ReactiveControllerHost;
  readonly #options: ResizeOptions;
  #transaction?: ResizeTransaction;
  #document?: Document;
  #presenting = false;
  #settleFrame?: number;

  constructor(host: HTMLElement & ReactiveControllerHost, options: ResizeOptions) {
    this.#host = host;
    this.#options = options;
    host.addController(this);
  }

  get preview() {
    return this.#transaction?.status !== 'cancelled' ? this.#transaction?.preview : undefined;
  }

  get presentation() {
    const transaction = this.#transaction;
    return transaction?.status !== 'cancelled' ? transaction?.presentation : undefined;
  }

  get retainingHandles() {
    return this.#transaction?.pointerId !== undefined && this.#transaction.status !== 'cancelled';
  }

  get resizing() {
    return this.#presenting;
  }

  get policy() {
    return this.#transaction?.status !== 'cancelled' ? this.#transaction?.policy : undefined;
  }

  hostConnected() {
    this.#document = this.#host.ownerDocument;
    this.#host.addEventListener('pointerdown', this.#guardStart, true);
    this.#host.addEventListener('keydown', this.#guardStart, true);
    this.#document.addEventListener('keydown', this.#globalKeydown);
  }

  hostDisconnected() {
    this.#host.removeEventListener('pointerdown', this.#guardStart, true);
    this.#host.removeEventListener('keydown', this.#guardStart, true);
    this.#document?.removeEventListener('keydown', this.#globalKeydown);
    this.#document = undefined;
    this.#transaction = undefined;
    this.#finishPresentation();
  }

  hostUpdated() {
    if (!this.#presenting || this.preview || this.retainingHandles || this.#settleFrame !== undefined) return;
    this.#settleFrame = requestAnimationFrame(() => {
      this.#settleFrame = requestAnimationFrame(() => {
        this.#settleFrame = undefined;
        if (this.preview || this.retainingHandles) return;
        this.#finishPresentation();
        this.#host.requestUpdate();
      });
    });
  }

  resetForRestore() {
    this.cancel();
    this.#finishPresentation();
  }

  cancel() {
    const transaction = this.#transaction;
    if (!transaction || transaction.status === 'cancelled') return;
    this.#transaction = { handle: transaction.handle, pointerId: transaction.pointerId, status: 'cancelled' };
    this.#host.requestUpdate();
  }

  input(event: Event, boundary: WorkspaceBoundary) {
    this.#resize(event, boundary, false);
  }

  change(event: Event, boundary: WorkspaceBoundary) {
    this.#resize(event, boundary, true);
  }

  gesture = (event: CustomEvent<GestureInput>) => {
    const handle = this.#ownedHandle(event);
    if (!handle) return;
    const input = event.detail;
    if (input.kind === 'pointerdown' && input.event.button === 0 && input.event.isPrimary && this.#options.enabled()) {
      const boundary = this.#options.boundaries().find(item => item.key === handle.dataset.boundary);
      if (boundary) this.#begin(handle, boundary, input.event.pointerId);
    }
    if (input.kind === 'pointerend') this.#endPointer(handle, input);
  };

  #endPointer(handle: ResizeHandle, input: Extract<GestureInput, { kind: 'pointerend' }>) {
    const transaction = this.#transaction;
    if (transaction?.handle !== handle || transaction.pointerId !== input.event.pointerId) return;
    if (input.interrupted) this.cancel();
    const terminal = this.#transaction;
    if (!terminal) return;
    if (terminal.status === 'cancelled') {
      terminal.pointerId = undefined;
      this.#resetHandle(handle);
    } else if (terminal.status === 'committed') this.#transaction = undefined;
    else terminal.pointerId = undefined;
    this.#host.requestUpdate();
  }

  #ownedHandle(event: Event): ResizeHandle | undefined {
    return event
      .composedPath()
      .find(
        (item): item is ResizeHandle =>
          item instanceof ResizeHandle && item.isConnected && item.getRootNode() === this.#host.shadowRoot
      );
  }

  #guardStart = (event: Event) => {
    if (!this.#ownedHandle(event)) return;
    if (
      event instanceof KeyboardEvent &&
      !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)
    )
      return;
    if (this.#options.enabled() && !this.#pointerPending) {
      if (event instanceof KeyboardEvent && this.#transaction?.status === 'cancelled') this.#transaction = undefined;
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  get #pointerPending() {
    const transaction = this.#transaction;
    return (
      transaction?.pointerId !== undefined &&
      transaction.handle.isConnected &&
      transaction.handle.getRootNode() === this.#host.shadowRoot
    );
  }

  #begin(handle: ResizeHandle, origin: WorkspaceBoundary, pointerId?: number) {
    const layout = this.#options.layout();
    if (!layout) return;
    this.#transaction = {
      handle,
      pointerId,
      status: 'active',
      baseline: structuredClone(layout),
      origin,
      policy: this.#options.policy(),
      available: this.#options.available(),
      presentation: this.#options.presentation()
    };
  }

  #beginPresentation() {
    if (this.#settleFrame !== undefined) cancelAnimationFrame(this.#settleFrame);
    this.#settleFrame = undefined;
    this.#presenting = true;
  }

  #finishPresentation() {
    if (this.#settleFrame !== undefined) cancelAnimationFrame(this.#settleFrame);
    this.#settleFrame = undefined;
    this.#presenting = false;
  }

  #resetHandle(target: ResizeHandle) {
    void this.#host.updateComplete.then(() => {
      if (!target.isConnected || target.getRootNode() !== this.#host.shadowRoot) return;
      const boundary = this.#options.boundaries().find(item => item.key === target.dataset.boundary);
      if (boundary) target.valueAsNumber = boundary.value;
    });
  }

  #globalKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented || this.#transaction?.status !== 'active') return;
    event.preventDefault();
    this.#options.cancelForUser();
  };

  #resize(event: Event, boundary: WorkspaceBoundary, committed: boolean) {
    event.stopPropagation();
    const handle = event.currentTarget;
    if (!(handle instanceof ResizeHandle) || !this.#ownedHandle(event)) return;
    if (!this.#transaction && this.#options.enabled()) this.#begin(handle, boundary);
    const transaction = this.#transaction;
    if (!transaction || transaction.handle !== handle || transaction.status !== 'active') return;
    const preview = this.#resizePreview(handle.valueAsNumber, transaction);
    if (!preview) return;
    this.#beginPresentation();
    transaction.preview = preview;
    if (committed) this.#commit(preview, transaction);
    else this.#host.requestUpdate();
  }

  #commit(preview: WorkspaceLayout, transaction: ResizeOperation) {
    transaction.preview = undefined;
    transaction.status = 'committed';
    if (transaction.pointerId === undefined) this.#transaction = undefined;
    this.#options.commit(preview);
  }

  #resizePreview(value: number, transaction: ResizeOperation): WorkspaceLayout | undefined {
    const { origin, baseline } = transaction;
    const delta = (value - origin.value) * (origin.branch.axis === 'horizontal' ? 1 : -1);
    const sizes = resizeSizes(origin.sizes, origin.minima, {
      boundary: origin.index,
      delta,
      policy: transaction.policy
    });
    if (!sizes.some((size, index) => Math.abs(size - origin.sizes[index]!) > 0.001)) return structuredClone(baseline);
    return rebaseProjectedSplit(baseline, origin.branch, sizes, transaction.available);
  }
}
