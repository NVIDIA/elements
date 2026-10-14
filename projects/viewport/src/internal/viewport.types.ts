// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface ViewportTransform {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

export interface ViewportPoint {
  readonly x: number;
  readonly y: number;
}

export interface ViewportRect extends ViewportPoint {
  readonly width: number;
  readonly height: number;
}

export interface ViewportTarget extends HTMLElement {
  readonly hasUpdated: boolean;
  readonly scale: number;
  readonly minScale: number;
  readonly maxScale: number;
  readonly pannable: boolean;
  readonly zoomable: boolean;
  getTransform(): ViewportTransform;
  getVisibleRect(): ViewportRect;
}

export declare class ViewportAccessory {
  commandfor: string | null;
  commandForElement: HTMLElement | null;
  protected resolveViewport(): ViewportTarget | null;
  /** @internal */
  protected viewportConnected(target: ViewportTarget): void;
  /** @internal */
  protected viewportChanged(target: ViewportTarget): void;
  /** @internal */
  protected viewportDisconnected(): void;
}
