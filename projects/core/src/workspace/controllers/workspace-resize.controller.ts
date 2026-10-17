// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

import { type GestureInput, matchesElementName } from '@nvidia-elements/core/internal';

import { ResizeHandle } from '@nvidia-elements/core/resize-handle';

import { resizeSizes } from '../utils/geometry/partition.utils.js';
import { isResizeKey } from '../utils/interaction/resize-input.utils.js';
import { rebaseProjectedSplit } from '../utils/model/projection.utils.js';

import type { WorkspaceBoundary } from '../utils/geometry/allocation.utils.js';
import type { WorkspaceLayout } from '../utils/model/layout.utils.js';
import type { WorkspaceMeasurementChange, WorkspaceMeasurements } from '../utils/presentation/measurements.utils.js';

interface WorkspaceResizeHost extends HTMLElement, ReactiveControllerHost {
  readonly resizePolicy: 'stop' | 'propagate';
}

interface ResizePresentation {
  measurements: WorkspaceMeasurements;
  rearrangeable: boolean;
  closable: boolean;
  fullscreenable: boolean;
}

interface WorkspaceResizeDelegate {
  readonly isEnabled: () => boolean;
  readonly getLayout: () => WorkspaceLayout | undefined;
  readonly getBoundaries: () => WorkspaceBoundary[];
  readonly getAvailablePanels: () => string[];
  readonly getPresentation: () => ResizePresentation;
  readonly cancelForUser: () => void;
  readonly commitLayout: (layout: WorkspaceLayout) => void;
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
  pendingValue?: number;
  preview?: { value: number; layout: WorkspaceLayout };
}

type ResizeTransaction = ResizeOperation | { handle: ResizeHandle; pointerId?: number; status: 'cancelled' };

export class WorkspaceResizeController {
  readonly #host: WorkspaceResizeHost;
  readonly #delegate: WorkspaceResizeDelegate;
  #transaction?: ResizeTransaction;
  #document?: Document;
  #presenting = false;
  #settleFrame?: number;

  constructor(host: WorkspaceResizeHost, delegate: WorkspaceResizeDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    host.addController(this);
  }

  get preview() {
    return this.#transaction?.status !== 'cancelled' ? this.#transaction?.preview?.layout : undefined;
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

  get policy(): 'stop' | 'propagate' {
    const transaction = this.#transaction;
    if (transaction && transaction.status !== 'cancelled') return transaction.policy;
    return this.#host.resizePolicy === 'propagate' ? 'propagate' : 'stop';
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

  hostUpdate() {
    const transaction = this.#transaction;
    if (transaction?.status !== 'active' || transaction.pendingValue === undefined) return;

    const value = transaction.pendingValue;
    transaction.pendingValue = undefined;
    this.#updatePreview(value, transaction);
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

  handleMeasurementsChange(change: WorkspaceMeasurementChange) {
    if (change.spaceChanged) {
      this.cancel();
    }
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
    const handle = this.#findOwnedHandle(event);
    if (!handle) return;
    const input = event.detail;
    if (
      input.kind === 'pointerdown' &&
      input.event.button === 0 &&
      input.event.isPrimary &&
      this.#delegate.isEnabled()
    ) {
      const boundary = this.#delegate.getBoundaries().find(item => item.key === handle.dataset.boundary);
      if (boundary) {
        this.#begin(handle, boundary, input.event.pointerId);
      }
    }
    if (input.kind === 'pointerend') {
      this.#endPointer(handle, input);
    }
  };

  #endPointer(handle: ResizeHandle, input: Extract<GestureInput, { kind: 'pointerend' }>) {
    const transaction = this.#transaction;
    if (transaction?.handle !== handle || transaction.pointerId !== input.event.pointerId) return;

    if (input.interrupted) {
      this.cancel();
    }

    const terminal = this.#transaction;
    if (!terminal) return;
    if (terminal.status === 'cancelled') {
      terminal.pointerId = undefined;
      void this.#resetHandle(handle);
    } else if (terminal.status === 'committed') {
      this.#transaction = undefined;
    } else {
      terminal.pointerId = undefined;
    }

    this.#host.requestUpdate();
  }

  #findOwnedHandle(event: Event): ResizeHandle | undefined {
    return event
      .composedPath()
      .find(
        (item): item is ResizeHandle =>
          isResizeHandle(item) && item.isConnected && item.getRootNode() === this.#host.shadowRoot
      );
  }

  #guardStart = (event: Event) => {
    if (!this.#findOwnedHandle(event)) return;
    if (event instanceof KeyboardEvent && !isResizeKey(event.key)) {
      return;
    }
    if (this.#delegate.isEnabled() && !this.#pointerPending) {
      if (event instanceof KeyboardEvent && this.#transaction?.status === 'cancelled') {
        this.#transaction = undefined;
      }
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
    const layout = this.#delegate.getLayout();
    if (!layout) return;
    this.#transaction = {
      handle,
      pointerId,
      status: 'active',
      baseline: structuredClone(layout),
      origin,
      policy: this.policy,
      available: this.#delegate.getAvailablePanels(),
      presentation: this.#delegate.getPresentation()
    };
  }

  #beginPresentation() {
    if (this.#settleFrame !== undefined) {
      cancelAnimationFrame(this.#settleFrame);
    }
    this.#settleFrame = undefined;
    this.#presenting = true;
  }

  #finishPresentation() {
    if (this.#settleFrame !== undefined) {
      cancelAnimationFrame(this.#settleFrame);
    }
    this.#settleFrame = undefined;
    this.#presenting = false;
  }

  async #resetHandle(target: ResizeHandle) {
    await this.#host.updateComplete;
    if (!target.isConnected || target.getRootNode() !== this.#host.shadowRoot) return;

    const boundary = this.#delegate.getBoundaries().find(item => item.key === target.dataset.boundary);
    if (boundary) {
      target.valueAsNumber = boundary.value;
    }
  }

  #globalKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented || this.#transaction?.status !== 'active') return;
    event.preventDefault();
    this.#delegate.cancelForUser();
  };

  #resize(event: Event, boundary: WorkspaceBoundary, committed: boolean) {
    event.stopPropagation();
    const handle = event.currentTarget;
    if (!isResizeHandle(handle) || !this.#findOwnedHandle(event)) return;
    if (!this.#transaction && this.#delegate.isEnabled()) {
      this.#begin(handle, boundary);
    }
    const transaction = this.#transaction;
    if (!transaction || transaction.handle !== handle || transaction.status !== 'active') return;
    const value = handle.valueAsNumber;
    if (committed) {
      transaction.pendingValue = undefined;
      const preview = this.#updatePreview(value, transaction);
      if (preview) {
        this.#commit(preview, transaction);
      }
      return;
    }
    this.#queuePreview(value, transaction);
  }

  #queuePreview(value: number, transaction: ResizeOperation) {
    if (
      transaction.pendingValue === value ||
      (transaction.pendingValue === undefined && transaction.preview?.value === value)
    ) {
      return;
    }
    transaction.pendingValue = value;
    this.#host.requestUpdate();
  }

  #updatePreview(value: number, transaction: ResizeOperation) {
    if (transaction.preview?.value === value) {
      return transaction.preview.layout;
    }
    const layout = this.#createResizePreview(value, transaction);
    if (layout) {
      this.#beginPresentation();
      transaction.preview = { value, layout };
    }
    return layout;
  }

  #commit(preview: WorkspaceLayout, transaction: ResizeOperation) {
    transaction.preview = undefined;
    transaction.status = 'committed';
    if (transaction.pointerId === undefined) {
      this.#transaction = undefined;
    }
    this.#delegate.commitLayout(preview);
  }

  #createResizePreview(value: number, transaction: ResizeOperation): WorkspaceLayout | undefined {
    const { origin, baseline } = transaction;
    const delta = (value - origin.value) * (origin.branch.axis === 'horizontal' ? 1 : -1);
    const sizes = resizeSizes(origin.sizes, origin.minima, {
      boundary: origin.index,
      delta,
      policy: transaction.policy
    });
    if (sizes.every((size, index) => size === origin.sizes[index])) return structuredClone(baseline);
    return rebaseProjectedSplit(baseline, origin.branch, sizes, transaction.available);
  }
}

function isResizeHandle(target: EventTarget | null): target is ResizeHandle {
  return target !== null && matchesElementName(target, ResizeHandle);
}
